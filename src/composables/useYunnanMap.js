import { onBeforeUnmount, ref, shallowRef } from 'vue'
import L from 'leaflet'
import { CITIES, CITY_MAX_ZOOM, CITY_MIN_ZOOM, YUNNAN_BOUNDS, YUNNAN_CENTER, YUNNAN_ZOOM } from '../data/cities'
import { pointInGeoJSON } from '../utils/geo'

const asset = (p) => `${import.meta.env.BASE_URL}${p}`.replace(/\/{2,}/g, '/')
const TK = '09f2e7d13d1a49b3d39e7e1218bee905'

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function markerIcon(active) {
  return L.divIcon({
    className: 'pin-wrapper',
    html: `<span class="pin${active ? ' pin--active' : ''}"><i></i></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  })
}

function popupHtml(place) {
  const fallback = 'image/schoollogo.png'
  return `
    <article class="place-popup">
      <div class="place-popup__media">
        <img src="${escapeHtml(asset(place.logo))}" alt="${escapeHtml(place.name)}"
             onerror="this.onerror=null;this.src='${asset(fallback)}'" />
      </div>
      <div class="place-popup__body">
        <h3>${escapeHtml(place.name)}</h3>
        <p class="place-popup__addr">📍 ${escapeHtml(place.addr || '地址待补充')}</p>
        ${place.url ? `<a class="place-popup__link" href="${escapeHtml(place.url)}" target="_blank" rel="noopener">查看详情 →</a>` : ''}
      </div>
    </article>`
}

export function useYunnanMap() {
  const mapEl = ref(null)
  const map = shallowRef(null)
  const loading = ref(true)
  const activeCity = ref(null)
  const cityCounts = ref({})
  const visiblePlaces = ref([])

  let boundaryLayer = null
  const cityLayers = new Map() // code -> { layer, geojson }
  let markerLayer = null
  let allPlaces = []
  let resizeObserver = null

  // 内边距按容器尺寸自适应：小地图（缩到左上角时）不能用固定 48px，否则算出来的缩放过小
  function fitPadding(m) {
    const size = m.getSize()
    return L.point(Math.min(48, size.x * 0.1), Math.min(48, size.y * 0.1))
  }

  async function loadJson(path) {
    const res = await fetch(asset(path))
    if (!res.ok) throw new Error(`${path} ${res.status}`)
    return res.json()
  }

  async function init() {
    const m = L.map(mapEl.value, {
      center: YUNNAN_CENTER,
      zoom: YUNNAN_ZOOM,
      minZoom: 5,
      maxZoom: 17,
      zoomControl: false,
      maxBounds: L.latLngBounds(YUNNAN_BOUNDS),
      maxBoundsViscosity: 0.8,
      attributionControl: false
    })
    map.value = m
    L.control.zoom({ position: 'bottomright' }).addTo(m)

    // 容器尺寸变化（例如地图缩到左上角）时同步重算，避免瓦片错位
    if (typeof ResizeObserver !== 'undefined') {
      let raf = 0
      resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => m.invalidateSize({ animate: false }))
      })
      resizeObserver.observe(mapEl.value)
    }

    L.tileLayer(
      `https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TK}`,
      { subdomains: '01234567', maxZoom: 17 }
    ).addTo(m)
    L.tileLayer(
      `https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TK}`,
      { subdomains: '01234567', maxZoom: 17 }
    ).addTo(m)

    markerLayer = L.layerGroup().addTo(m)

    // 省级轮廓
    loadJson('data/530000_full.json')
      .then((geojson) => {
        boundaryLayer = L.geoJSON(geojson, {
          style: { color: '#0e7490', weight: 2.4, opacity: 0.9, fill: false, interactive: false }
        }).addTo(m)
      })
      .catch((e) => console.warn('省界加载失败', e))

    // 州市边界
    await Promise.all(
      CITIES.map(async (city) => {
        try {
          const geojson = await loadJson(`data/${city.code}_full.json`)
          const layer = L.geoJSON(geojson, {
            style: { color: '#0e7490', weight: 1.4, opacity: 0.65, fillColor: '#5eead4', fillOpacity: 0.06 }
          })
          layer.bindTooltip(city.name, { sticky: true, className: 'city-tip' })
          layer.on('mouseover', () => !activeCity.value && layer.setStyle({ weight: 2.6, fillOpacity: 0.22, color: '#0f766e' }))
          layer.on('mouseout', () => !activeCity.value && layer.setStyle({ weight: 1.4, fillOpacity: 0.06, color: '#0e7490' }))
          layer.on('click', () => selectCity(city.code))
          layer.addTo(m)
          cityLayers.set(city.code, { layer, geojson })
        } catch (e) {
          console.warn(`${city.name} 边界加载失败`, e)
        }
      })
    )

    try {
      allPlaces = await loadJson('addr.json')
      allPlaces = allPlaces.map((p) => ({ ...p, logo: String(p.logo || '').replace(/^\.\.\//, '') }))
    } catch (e) {
      console.warn('旅居点数据加载失败', e)
      allPlaces = []
    }

    // 预先算出每个州市的点位数量
    const counts = {}
    CITIES.forEach((city) => {
      const entry = cityLayers.get(city.code)
      counts[city.code] = entry ? allPlaces.filter((p) => pointInGeoJSON(p.lng, p.lat, entry.geojson)).length : 0
    })
    cityCounts.value = counts

    renderMarkers(allPlaces)
    visiblePlaces.value = allPlaces
    loading.value = false

    m.on('contextmenu', () => reset())
  }

  function renderMarkers(places) {
    if (!markerLayer) return
    markerLayer.clearLayers()
    places.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], { icon: markerIcon(!!activeCity.value), riseOnHover: true })
      marker.bindPopup(popupHtml(place), { className: 'place-popup-shell', maxWidth: 300, minWidth: 260, autoPanPadding: [24, 24] })
      marker.bindTooltip(place.name, { direction: 'top', offset: [0, -10], className: 'place-tip' })
      markerLayer.addLayer(marker)
    })
  }

  function selectCity(code) {
    const m = map.value
    const entry = cityLayers.get(code)
    if (!m || !entry) return
    const city = CITIES.find((c) => c.code === code)
    activeCity.value = city

    cityLayers.forEach(({ layer }, key) => {
      const on = key === code
      layer.setStyle({ weight: on ? 2.6 : 1.2, color: on ? '#0f766e' : '#0e7490', fillOpacity: on ? 0.18 : 0.04 })
    })

    const places = allPlaces.filter((p) => pointInGeoJSON(p.lng, p.lat, entry.geojson))
    renderMarkers(places)
    visiblePlaces.value = places

    const bounds = entry.layer.getBounds()
    if (!bounds.isValid()) return
    // 以边界中心为目标，缩放到「刚好填满」并夹到 [CITY_MIN_ZOOM, CITY_MAX_ZOOM]
    // 用 flyTo(中心) 而不是 flyToBounds，保证州市一定居中（不被 maxBounds 拉偏）
    const fitZoom = m.getBoundsZoom(bounds, false, fitPadding(m))
    const zoom = Math.min(Math.max(fitZoom, CITY_MIN_ZOOM), CITY_MAX_ZOOM)
    m.flyTo(bounds.getCenter(), zoom, { duration: 0.7 })
  }

  function focusPlace(place) {
    const m = map.value
    if (!m || !place) return
    m.flyTo([place.lat, place.lng], Math.max(m.getZoom(), 12), { duration: 0.6 })
    markerLayer.eachLayer((layer) => {
      if (layer.getLatLng().lat === place.lat && layer.getLatLng().lng === place.lng) layer.openPopup()
    })
  }

  function reset() {
    const m = map.value
    if (!m) return
    activeCity.value = null
    cityLayers.forEach(({ layer }) => layer.setStyle({ weight: 1.4, color: '#0e7490', fillOpacity: 0.06 }))
    renderMarkers(allPlaces)
    visiblePlaces.value = allPlaces

    const province = boundaryLayer?.getBounds()
    if (province?.isValid()) {
      m.flyToBounds(province, { padding: fitPadding(m), maxZoom: YUNNAN_ZOOM, duration: 0.6 })
    } else {
      m.flyTo(YUNNAN_CENTER, YUNNAN_ZOOM, { duration: 0.6 })
    }
  }

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
    cityLayers.clear()
    boundaryLayer = null
    map.value?.remove()
  })

  return { mapEl, loading, activeCity, cityCounts, visiblePlaces, init, selectCity, reset, focusPlace, total: () => allPlaces.length }
}
