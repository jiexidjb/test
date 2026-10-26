import { onBeforeUnmount, ref, shallowRef } from 'vue'
import L from 'leaflet'
import { CITIES, CITY_MAX_ZOOM, CITY_MIN_ZOOM, YUNNAN_BOUNDS, YUNNAN_CENTER, YUNNAN_ZOOM } from '../data/cities'
import { pointInGeoJSON } from '../utils/geo'

const asset = (p) => `${import.meta.env.BASE_URL}${p}`.replace(/\/{2,}/g, '/')
const TK = '09f2e7d13d1a49b3d39e7e1218bee905'

// 缩放级别低于 START 时地图上一个旅居点都不显示；到 FULL 时全部显示
const POINT_START_ZOOM = 8
const POINT_FULL_ZOOM = 10

const placeKey = (p) => `${p.name}|${p.lat}|${p.lng}`

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function markerIcon() {
  return L.divIcon({
    className: 'pin-wrapper',
    html: '<span class="pin"><i></i></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  })
}

/**
 * popup 内容在「打开时」才生成并插入 DOM（Leaflet 支持传函数），
 * 图片带上 loading="lazy"，不点击就不会产生任何图片请求。
 */
function popupHtml(place) {
  const fallback = 'image/schoollogo.png'
  return `
    <article class="place-popup">
      <div class="place-popup__media">
        <img src="${escapeHtml(asset(place.logo))}" alt="${escapeHtml(place.name)}"
             loading="lazy" decoding="async" width="260" height="132"
             onerror="this.onerror=null;this.src='${asset(fallback)}'" />
      </div>
      <div class="place-popup__body">
        <h3>${escapeHtml(place.name)}</h3>
        <p class="place-popup__addr">${escapeHtml(place.addr || '地址待补充')}</p>
        ${place.url ? `<a class="place-popup__link" href="${escapeHtml(place.url)}" target="_blank" rel="noopener">查看详情 →</a>` : ''}
      </div>
    </article>`
}

// 按「到最近邻点位的距离」分档：越孤立的点越早出现，密集区靠后，
// 这样放大过程里点位是铺开出现的，而不是某个区域突然糊成一团
function assignShowZoom(places) {
  const n = places.length
  if (!n) return []

  const nearest = places.map((p, i) => {
    let min = Infinity
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const q = places[j]
      const dx = (p.lng - q.lng) * Math.cos((p.lat * Math.PI) / 180)
      const dy = p.lat - q.lat
      const d = Math.hypot(dx, dy)
      if (d < min) min = d
    }
    return min === Infinity ? 1 : min
  })

  const order = places.map((_, i) => i).sort((a, b) => nearest[b] - nearest[a])
  const bands = POINT_FULL_ZOOM - POINT_START_ZOOM + 1
  const step = n / bands
  const levels = new Array(n)
  order.forEach((idx, rank) => {
    levels[idx] = Math.min(POINT_START_ZOOM + Math.floor(rank / step), POINT_FULL_ZOOM)
  })

  return places.map((p, i) => ({ ...p, showZoom: levels[i] }))
}

export function useYunnanMap() {
  const mapEl = ref(null)
  const map = shallowRef(null)
  const loading = ref(true)
  const activeCity = ref(null)
  const cityCounts = ref({})
  const visiblePlaces = ref([])
  const zoomLevel = ref(YUNNAN_ZOOM)

  let boundaryLayer = null
  const cityLayers = new Map() // code -> { layer, geojson }
  let markerLayer = null
  const markerIndex = new Map() // key -> marker，用于增量增删，避免每次重建全部点位
  let allPlaces = []
  let resizeObserver = null
  let zoomRaf = 0
  let recoLayer = null // 问卷推荐点的专属图层，独立于普通点位，不受缩放级别影响

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
      // 左键放大全部关闭：双击、Shift + 左键框选都不再缩放
      doubleClickZoom: false,
      boxZoom: false,
      // 只保留滚轮和触摸双指缩放
      scrollWheelZoom: true,
      touchZoom: true,
      maxBounds: L.latLngBounds(YUNNAN_BOUNDS),
      maxBoundsViscosity: 0.8,
      attributionControl: false
    })
    map.value = m
    zoomLevel.value = m.getZoom()
    // 不加 +/- 控件：地图上任何左键操作都不放大，缩放只走滚轮和双指

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

    // 缩放过程中（flyTo / 滚轮动画会连续触发 zoom）逐帧刷新，点位才会「逐渐」冒出来
    const onZoom = () => {
      cancelAnimationFrame(zoomRaf)
      zoomRaf = requestAnimationFrame(refreshMarkers)
    }
    m.on('zoom', onZoom)
    m.on('zoomend', onZoom)

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
          // 左键点州市只做选中，不改变缩放和位置
          layer.on('click', () => selectCity(city.code, { fly: false }))
          layer.addTo(m)
          cityLayers.set(city.code, { layer, geojson })
        } catch (e) {
          console.warn(`${city.name} 边界加载失败`, e)
        }
      })
    )

    try {
      const raw = await loadJson('addr.json')
      allPlaces = assignShowZoom(raw.map((p) => ({ ...p, logo: String(p.logo || '').replace(/^\.\.\//, '') })))
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

    // 初始处于全省视图（zoom 7），低于 POINT_START_ZOOM，因此一个点位都不显示
    visiblePlaces.value = allPlaces
    refreshMarkers()
    loading.value = false

    // 右键：退回初始视野，点位随之消失
    m.on('contextmenu', () => reset())
  }

  function refreshMarkers() {
    const m = map.value
    if (!m || !markerLayer) return

    const zoom = m.getZoom()
    zoomLevel.value = zoom

    // 地图标记始终基于全省点位，只由当前缩放级别决定显示哪些
    const wanted = allPlaces.filter((p) => zoom >= (p.showZoom ?? POINT_START_ZOOM))
    const wantedKeys = new Set(wanted.map(placeKey))

    // 缩小时把超出当前级别的点位移除
    markerIndex.forEach((marker, key) => {
      if (!wantedKeys.has(key)) {
        markerLayer.removeLayer(marker)
        markerIndex.delete(key)
      }
    })

    // 放大时只补新增的，已存在的 marker 保持不动（不会闪烁）
    wanted.forEach((place) => {
      const key = placeKey(place)
      if (markerIndex.has(key)) return
      const marker = L.marker([place.lat, place.lng], {
        icon: markerIcon(),
        riseOnHover: true,
        keyboard: false
      })
      marker.bindPopup(() => popupHtml(place), {
        className: 'place-popup-shell',
        maxWidth: 300,
        minWidth: 260,
        autoPanPadding: [24, 24]
      })
      marker.bindTooltip(place.name, { direction: 'top', offset: [0, -10], className: 'place-tip' })
      marker.addTo(markerLayer)
      markerIndex.set(key, marker)
    })
  }

  function clearMarkers() {
    markerIndex.forEach((marker) => markerLayer?.removeLayer(marker))
    markerIndex.clear()
  }

  function recoIcon(rank) {
    return L.divIcon({
      className: 'reco-pin-wrapper',
      html: `<span class="reco-pin">${rank}</span>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })
  }

  function clearRecommendations() {
    recoLayer?.clearLayers()
  }

  /**
   * 缩略图模式（学术资源库打开时）彻底关闭地图交互：
   * 拖动、滚轮、双指、键盘都不响应，点击由 MapView 的遮罩接管去展开地图。
   * 注意不要碰 doubleClickZoom / boxZoom —— 这两个是业务上永久禁用的。
   */
  function setMapInteractive(enabled) {
    const m = map.value
    if (!m) return
    const fn = enabled ? 'enable' : 'disable'
    ;[m.dragging, m.scrollWheelZoom, m.touchZoom, m.keyboard].forEach((handler) => handler?.[fn]?.())
  }

  /** 展示问卷推荐结果：金银色序号点 + 自动框选 */
  function showRecommendations(list) {
    const m = map.value
    if (!m) return
    if (!recoLayer) recoLayer = L.layerGroup().addTo(m)
    recoLayer.clearLayers()

    const items = (list || []).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    if (!items.length) return

    const latlngs = []
    items.forEach((item, i) => {
      const marker = L.marker([item.lat, item.lng], {
        icon: recoIcon(i + 1),
        zIndexOffset: 1200,
        riseOnHover: true
      })
      const score = item.final ? Math.round(item.final) : ''
      const reason = (item.reasons || []).slice(0, 2).join(' · ')
      marker.bindPopup(
        `<article class="place-popup">
           <div class="place-popup__body">
             <h3>${escapeHtml(item.name)}</h3>
             <p class="place-popup__addr">推荐第 ${i + 1} 位${score ? ` · 综合 ${score} 分` : ''}</p>
             <p class="place-popup__addr">${escapeHtml(reason)}</p>
             ${item.url ? `<a class="place-popup__link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">查看详情 →</a>` : ''}
           </div>
         </article>`,
        { className: 'place-popup-shell', maxWidth: 300, minWidth: 240, autoPanPadding: [24, 24] }
      )
      marker.addTo(recoLayer)
      latlngs.push([item.lat, item.lng])
    })

    if (latlngs.length) {
      m.flyToBounds(L.latLngBounds(latlngs).pad(0.25), { maxZoom: 12, duration: 0.8 })
    }
  }

  function selectCity(code, { fly = true } = {}) {
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
    // 只切换侧栏列表，不动地图标记（标记只跟缩放级别走）
    visiblePlaces.value = places

    // 地图上左键点州市：只切换选中，不改变视野
    if (!fly) return

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
    const key = placeKey(place)
    const targetZoom = Math.max(m.getZoom(), 12)

    const openPopup = () => {
      // 放大过程中 marker 才被创建，兜底再刷一次
      if (!markerIndex.has(key)) refreshMarkers()
      markerIndex.get(key)?.openPopup()
    }

    m.flyTo([place.lat, place.lng], targetZoom, { duration: 0.6 })
    if (m.getZoom() >= POINT_FULL_ZOOM) openPopup()
    else m.once('moveend', openPopup)
  }

  function reset() {
    const m = map.value
    if (!m) return
    activeCity.value = null
    cityLayers.forEach(({ layer }) => layer.setStyle({ weight: 1.4, color: '#0e7490', fillOpacity: 0.06 }))
    visiblePlaces.value = allPlaces
    clearMarkers()
    clearRecommendations()
    m.closePopup()
    // 回到初始中心与缩放，zoom 小于 POINT_START_ZOOM，点位自然全部消失
    m.flyTo(YUNNAN_CENTER, YUNNAN_ZOOM, { duration: 0.6 })
  }

  onBeforeUnmount(() => {
    cancelAnimationFrame(zoomRaf)
    resizeObserver?.disconnect()
    resizeObserver = null
    clearMarkers()
    cityLayers.clear()
    boundaryLayer = null
    map.value?.remove()
  })

  return {
    mapEl,
    loading,
    activeCity,
    cityCounts,
    visiblePlaces,
    zoomLevel,
    pointStartZoom: POINT_START_ZOOM,
    init,
    selectCity,
    reset,
    focusPlace,
    showRecommendations,
    clearRecommendations,
    setMapInteractive,
    total: () => allPlaces.length
  }
}
