import { PLACE_PROFILES } from '../data/placeProfiles.js'

/** 五个评分维度，与第 11 题的排序题一一对应 */
export const WEIGHT_KEYS = ['nature', 'medical', 'transport', 'cost', 'social']

/** 第 11 题按名次映射权重：第 1 位 30% … 第 5 位 12%，合计 100% */
const RANK_WEIGHTS = [0.3, 0.24, 0.19, 0.15, 0.12]

/** 结果页与地图页共用的分类切换项 */
export const BOARD_TABS = [
  { key: 'overall', label: '综合推荐' },
  { key: 'nature', label: '气候环境' },
  { key: 'medical', label: '医疗' },
  { key: 'cost', label: '性价比' },
  { key: 'transport', label: '交通' },
  { key: 'social', label: '文娱' }
]

/** 海拔适宜度：1500-2000 米最佳，越高越不适合久居 */
function altitudeFit(alt) {
  if (alt <= 1200) return 96
  if (alt <= 1600) return 100
  if (alt <= 2000) return 96
  if (alt <= 2300) return 80
  if (alt <= 2600) return 62
  if (alt <= 3000) return 38
  return 15
}

/**
 * 1. 由问卷推导权重
 *    主干来自第 11 题的排序（名次映射权重），其余题目做系数修正。
 */
export function buildWeights(a) {
  const w = {}
  WEIGHT_KEYS.forEach((k) => {
    w[k] = 0
  })

  // 第 11 题：按排序名次赋权
  const order = Array.isArray(a.q11) ? a.q11 : []
  order.forEach((key, i) => {
    if (WEIGHT_KEYS.includes(key)) w[key] = RANK_WEIGHTS[i] ?? 0
  })
  // 排序异常时退化为均分，避免权重全为 0
  if (WEIGHT_KEYS.reduce((s, k) => s + w[k], 0) <= 0) {
    WEIGHT_KEYS.forEach((k) => {
      w[k] = 1 / WEIGHT_KEYS.length
    })
  }

  // 第 14 题：气候敏感度 → 自然维度权重 0.6x ~ 1.4x
  const sensitivity = Number.isFinite(Number(a.q14)) ? Number(a.q14) : 60
  w.nature *= 0.6 + 0.8 * (sensitivity / 100)

  // 第 15 题：医疗可达性要求越高，医疗权重越大
  const medicalBoost = { m15: 1.5, m30: 1.25, clinic: 1.1, none: 0.9 }[a.q15] ?? 1
  w.medical *= medicalBoost

  // 第 12 题：住得越久，越在乎成本
  const stayBoost = { '1_2w': 0.9, '1_3m': 1.1, '3m_plus': 1.35, depends: 1 }[a.q12] ?? 1
  w.cost *= stayBoost

  // 第 7 题：疾病控制情况
  if (a.q7 === 'poor') w.medical *= 1.2
  else if (a.q7 === 'fair') w.medical *= 1.1

  // 第 8 题：行动能力
  if (a.q8 === 'bedridden') {
    w.medical *= 1.2
    w.transport *= 1.25
  } else if (a.q8 === 'aid') {
    w.medical *= 1.1
    w.transport *= 1.1
  }

  // 第 2 题：75 岁以上更依赖医疗与交通
  if (a.q2 === 'ge75') {
    w.medical *= 1.15
    w.transport *= 1.1
  }

  const sum = WEIGHT_KEYS.reduce((s, k) => s + w[k], 0) || 1
  WEIGHT_KEYS.forEach((k) => {
    w[k] = w[k] / sum
  })
  return w
}

/**
 * 2. 硬约束：不参与打分，直接剔除。
 *    顺序即放宽顺序（末尾的先放宽），保证结果不足 5 个时不会空手而归。
 */
export function buildRules(a) {
  const rules = []

  if (a.q15 === 'm15') rules.push({ label: '15 分钟内可达综合医院', test: (p) => p.hospitalMin <= 30 })
  else if (a.q15 === 'm30') rules.push({ label: '30 分钟内可达医院', test: (p) => p.hospitalMin <= 45 })
  else if (a.q15 === 'clinic') rules.push({ label: '1 小时内可达医院', test: (p) => p.hospitalMin <= 90 })

  const diseases = a.q6 || []
  if (diseases.includes('heart')) {
    rules.push({ label: '海拔不超过 2200 米（心脏病）', test: (p) => p.altitude <= 2200 })
  }
  if (diseases.includes('respiratory')) {
    rules.push({ label: '海拔不超过 2000 米（呼吸系统疾病）', test: (p) => p.altitude <= 2000 })
  }

  if (a.q8 === 'bedridden') {
    rules.push({ label: '1 小时内可达医院（行动不便）', test: (p) => p.hospitalMin <= 60 })
  }

  const budget = Number(a.q13)
  if (budget > 0) {
    const limit = budget * 1.6 + 300
    rules.push({ label: `月均花费控制在 ${Math.round(limit)} 元以内`, test: (p) => p.monthly <= limit })
  }

  return rules
}

/** 3. 单点打分：五维得分 → 加权基础分 → 短板惩罚 */
export function scorePlace(place, profile, a, weights) {
  const nature =
    0.45 * profile.climate + 0.2 * profile.air + 0.15 * profile.quiet + 0.2 * altitudeFit(profile.altitude)

  const scores = {
    nature,
    medical: profile.medical,
    transport: profile.transport,
    social: profile.social,
    cost: profile.cost
  }

  // 超预算时成本维度线性衰减
  const budget = Number(a.q13)
  if (budget > 0 && profile.monthly > budget) {
    const over = (profile.monthly - budget) / budget
    scores.cost = Math.max(0, scores.cost * (1 - Math.min(0.8, over)))
  }

  const base = WEIGHT_KEYS.reduce((s, k) => s + weights[k] * scores[k], 0)
  const weakest = Math.min(...WEIGHT_KEYS.map((k) => scores[k]))
  const final = base * (0.78 + 0.22 * (weakest / 100))

  return { scores, base, final, weakest }
}

function reasonsFor(profile, scores, a, weights) {
  const list = [
    `气候 ${Math.round(scores.nature)} 分 · 海拔 ${profile.altitude} 米`,
    profile.hospitalMin <= 30
      ? `综合医院约 ${profile.hospitalMin} 分钟车程`
      : `医院约 ${profile.hospitalMin} 分钟车程`,
    `月均约 ${profile.monthly} 元${a.q13 && profile.monthly <= Number(a.q13) ? '，在预算内' : ''}`
  ]
  if (profile.hubMin <= 45) list.push(`距机场/高铁约 ${profile.hubMin} 分钟`)

  // 找出权重最高且得分不错的维度，作为"最契合"标签
  const top = [...WEIGHT_KEYS].sort((x, y) => weights[y] - weights[x])[0]
  return { list, focus: top }
}

/**
 * 主入口
 * @param {object} answers 问卷答案
 * @param {Array} places addr.json 中的点位
 */
export function recommend(answers, places) {
  const weights = buildWeights(answers)
  const rules = buildRules(answers)

  // addr.json 里有同名重复记录，按名称去重
  const seen = new Set()
  const candidates = (places || [])
    .filter((p) => {
      if (seen.has(p.name)) return false
      seen.add(p.name)
      return true
    })
    .map((p) => ({ place: p, profile: PLACE_PROFILES[p.name] }))
    .filter((x) => x.profile)

  // 逐条放宽，直到凑够 5 个
  let active = rules.slice()
  const relaxed = []
  const apply = () => candidates.filter(({ profile }) => active.every((r) => r.test(profile)))

  let pool = apply()
  while (pool.length < 5 && active.length) {
    const dropped = active[active.length - 1]
    active = active.slice(0, -1)
    relaxed.push(dropped.label)
    pool = apply()
  }

  const scored = pool
    .map(({ place, profile }) => {
      const { scores, base, final, weakest } = scorePlace(place, profile, answers, weights)
      const { list, focus } = reasonsFor(profile, scores, answers, weights)
      return { ...place, profile, scores, base, final, weakest, reasons: list, focus }
    })
    .sort((x, y) => y.final - x.final)

  // 多样性约束：同一区县最多 2 个，避免 Top5 全落在同一个古镇
  const picked = []
  const countyCount = {}
  for (const item of scored) {
    const key = item.profile.county || item.profile.city
    if ((countyCount[key] || 0) >= 2) continue
    countyCount[key] = (countyCount[key] || 0) + 1
    picked.push(item)
    if (picked.length === 5) break
  }
  if (picked.length < 5) {
    for (const item of scored) {
      if (picked.includes(item)) continue
      picked.push(item)
      if (picked.length === 5) break
    }
  }

  const top = picked.map((item, i) => ({ ...item, rank: i + 1 }))

  const board = (key) =>
    scored
      .slice()
      .sort((x, y) => y.scores[key] - x.scores[key])
      .slice(0, 5)
      .map((item, i) => ({ ...item, rank: i + 1 }))

  return {
    weights,
    items: top,
    boards: {
      nature: board('nature'),
      medical: board('medical'),
      cost: board('cost'),
      transport: board('transport'),
      social: board('social')
    },
    matched: scored.length,
    total: candidates.length,
    relaxed
  }
}
