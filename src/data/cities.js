// 云南省 16 个州市，code 对应 data/{code}_full.json 行政边界
export const CITIES = [
  { code: '530100', name: '昆明市', short: '昆明' },
  { code: '530300', name: '曲靖市', short: '曲靖' },
  { code: '530400', name: '玉溪市', short: '玉溪' },
  { code: '530500', name: '保山市', short: '保山' },
  { code: '530600', name: '昭通市', short: '昭通' },
  { code: '530700', name: '丽江市', short: '丽江' },
  { code: '530800', name: '普洱市', short: '普洱' },
  { code: '530900', name: '临沧市', short: '临沧' },
  { code: '532300', name: '楚雄州', short: '楚雄' },
  { code: '532500', name: '红河州', short: '红河' },
  { code: '532600', name: '文山州', short: '文山' },
  { code: '532800', name: '西双版纳州', short: '西双版纳' },
  { code: '532900', name: '大理州', short: '大理' },
  { code: '533100', name: '德宏州', short: '德宏' },
  { code: '533300', name: '怒江州', short: '怒江' },
  { code: '533400', name: '迪庆州', short: '迪庆' }
]

export const YUNNAN_CENTER = [25.0, 101.5]
export const YUNNAN_ZOOM = 7

// 点击州市后的缩放区间。云南各州市南北跨度大，单纯 fitBounds 只算到 zoom 9 左右，
// 和全省视图（zoom 7）差别很小，看起来就像「放不大」；这里用下限强制明显放大，
// 上限避免小州市（德宏、西双版纳）放得太近。想更保守就把下限调回 9。
export const CITY_MIN_ZOOM = 10
export const CITY_MAX_ZOOM = 13

// 可移动范围。真实省界为 lng 97.53~106.19 / lat 21.14~29.22，
// 这里四周留出余量（尤其东侧，文山到 106.20），否则边缘州市会被 maxBounds 拉偏、无法居中
export const YUNNAN_BOUNDS = [
  [20.4, 96.6],
  [30.0, 107.0]
]
