// 射线法：判断点是否在单个环内
function pointInRing(lng, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersects = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

// Polygon：必须在外环内且不在内环（洞）内
function pointInPolygon(lng, lat, coordinates) {
  const [outer, ...holes] = coordinates
  if (!pointInRing(lng, lat, outer)) return false
  return !holes.some((hole) => pointInRing(lng, lat, hole))
}

// 把 FeatureCollection / Feature / Geometry 统一摊平成 Polygon 坐标数组
export function collectPolygons(geojson) {
  if (!geojson) return []
  if (geojson.type === 'FeatureCollection') {
    return geojson.features.flatMap((f) => collectPolygons(f.geometry || f))
  }
  if (geojson.type === 'Feature') return collectPolygons(geojson.geometry)
  if (geojson.type === 'Polygon') return [geojson.coordinates]
  if (geojson.type === 'MultiPolygon') return geojson.coordinates
  return []
}

export function pointInGeoJSON(lng, lat, geojson) {
  return collectPolygons(geojson).some((polygon) => pointInPolygon(lng, lat, polygon))
}
