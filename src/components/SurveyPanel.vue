<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Close } from '@element-plus/icons-vue'
import { SURVEY, createAnswers } from '../data/survey'
import { BOARD_TABS, WEIGHT_KEYS, recommend } from '../utils/recommend'
import { useRecommendedPlaces } from '../composables/useRecommendation'
import { originVars, useOverlay } from '../composables/useOverlay'

const props = defineProps({
  // 触发元素（左下角入口卡片）的矩形，用来计算弹出起点
  origin: { type: Object, default: null }
})
const emit = defineEmits(['close'])
const router = useRouter()
const { setRecommendation } = useRecommendedPlaces()
const { openOverlay, closeOverlay } = useOverlay()

const shellStyle = computed(() => {
  if (!props.origin) return {}
  const mobile = window.innerWidth <= 980
  const w = mobile ? window.innerWidth : Math.min(940, window.innerWidth - 40)
  const h = mobile ? window.innerHeight : window.innerHeight - 40
  return originVars(props.origin, w, h)
})

function close() {
  closeOverlay()
  emit('close')
}

const asset = (p) => `${import.meta.env.BASE_URL}${p}`.replace(/\/{2,}/g, '/')

const BY_ID = Object.fromEntries(SURVEY.map((q) => [q.id, q]))
const STEPS = [
  { title: '基本情况', ids: ['q1', 'q2', 'q3', 'q4', 'q5'] },
  { title: '健康状况', ids: ['q6', 'q7', 'q8'] },
  { title: '选址偏好', ids: ['q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15'] },
  { title: '平台反馈', ids: ['q16', 'q17', 'q18', 'q19', 'q20'] }
]

const DIM_LABEL = { nature: '气候环境', medical: '医疗', transport: '交通', cost: '性价比', social: '文娱' }

const answers = ref(createAnswers())
const step = ref(0)
const result = ref(null)
const places = ref([])
const errorMsg = ref('')
const board = ref('overall')

const isResults = computed(() => step.value >= STEPS.length)

function visible(q) {
  if (!q.showIf) return true
  return answers.value[q.showIf.id] === q.showIf.value
}

const currentQuestions = computed(() => {
  const s = STEPS[Math.min(step.value, STEPS.length - 1)]
  return s.ids
    .map((id) => BY_ID[id])
    .filter((q) => q && visible(q))
})

// 第 10 题的排序项跟随第 9 题的选择
watch(
  () => [...(answers.value.q9 || [])],
  (list) => {
    const kept = (answers.value.q10 || []).filter((v) => list.includes(v))
    const added = list.filter((v) => !kept.includes(v))
    answers.value.q10 = [...kept, ...added]
  }
)

const errors = computed(() => {
  const e = {}
  currentQuestions.value.forEach((q) => {
    if (q.optional) return
    const v = answers.value[q.id]
    if (q.type === 'single' && !v) e[q.id] = '请选择一项'
    if (q.type === 'multi' && (!v || !v.length)) e[q.id] = '请至少选择一项'
    // 只选了 1 个因素时不必排序，不拦
    if (q.type === 'rank' && (!v || !v.length)) e[q.id] = '请先在上题选择关注因素'
    if (q.type === 'number') {
      const n = Number(v)
      if (!(n >= q.min && n <= q.max)) e[q.id] = `请填写 ${q.min}–${q.max} 之间的数值`
    }
  })
  return e
})

function toggleMulti(q, value) {
  const arr = answers.value[q.id]
  const i = arr.indexOf(value)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(value)

  if (q.id === 'q6') {
    if (value === 'none' && arr.includes('none')) {
      answers.value.q6 = ['none']
    } else if (value !== 'none') {
      answers.value.q6 = answers.value.q6.filter((v) => v !== 'none')
    }
  }
}

function labelOf(q, value) {
  const src = q.optionSource ? BY_ID[q.optionSource] : q
  return src?.options?.find((o) => o.value === value)?.label || value
}

function moveRank(i, dir) {
  const arr = answers.value.q10
  const j = i + dir
  if (j < 0 || j >= arr.length) return
  const tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
}

async function loadPlaces() {
  try {
    const res = await fetch(asset('addr.json'))
    if (!res.ok) throw new Error(String(res.status))
    places.value = await res.json()
  } catch (e) {
    console.warn('点位数据加载失败', e)
    places.value = []
  }
}

onMounted(() => {
  openOverlay()
  loadPlaces()
})

onBeforeUnmount(closeOverlay)

async function goNext() {
  if (Object.keys(errors.value).length) {
    errorMsg.value = '还有题目没有完成'
    return
  }
  errorMsg.value = ''

  if (step.value < STEPS.length - 1) {
    step.value += 1
    return
  }

  if (!places.value.length) await loadPlaces()
  result.value = recommend(answers.value, places.value)
  board.value = 'overall'
  step.value = STEPS.length
  document.querySelector('.survey-body')?.scrollTo({ top: 0 })
}

function restart() {
  answers.value = createAnswers()
  result.value = null
  step.value = 0
  errorMsg.value = ''
}

function openOnMap() {
  if (!result.value) return
  // 把整份结果和当前选中的分类一起带到地图页
  setRecommendation(result.value, board.value)
  close()
  router.push({ name: 'map' })
}

const boardItems = computed(() => {
  if (!result.value) return []
  return board.value === 'overall' ? result.value.items : result.value.boards[board.value] || []
})

const weightList = computed(() => {
  if (!result.value) return []
  return WEIGHT_KEYS.map((k) => ({ key: k, label: DIM_LABEL[k], value: Math.round(result.value.weights[k] * 100) }))
})
</script>

<template>
  <div class="survey-overlay">
    <div class="survey-shell" :style="shellStyle">
      <header class="survey-head">
        <div class="survey-head__text">
          <h2>{{ isResults ? '为你推荐的旅居点' : '旅居需求调查' }}</h2>
          <p v-if="!isResults">第 {{ step + 1 }} / {{ STEPS.length }} 步 · {{ STEPS[step].title }}</p>
          <p v-else>基于问卷权重与 73 个旅居点的多维画像计算</p>
        </div>
        <button class="survey-close" aria-label="关闭" @click="close"><Close /></button>
      </header>

      <div v-if="!isResults" class="survey-progress">
        <span v-for="(s, i) in STEPS" :key="s.title" :class="{ 'is-on': i <= step }"></span>
      </div>

      <div class="survey-body">
        <template v-if="!isResults">
          <article
            v-for="(q, i) in currentQuestions"
            :key="q.id"
            class="survey-q"
            :style="{ '--qi': i }"
          >
            <h3><em>{{ q.no }}</em>{{ q.title }}</h3>
            <p v-if="q.hint" class="survey-q__hint">{{ q.hint }}</p>

            <div v-if="q.type === 'single'" class="opt-list">
              <button
                v-for="o in q.options"
                :key="o.value"
                class="opt"
                :class="{ 'opt--on': answers[q.id] === o.value }"
                @click="answers[q.id] = o.value"
              >
                <span class="opt__dot"></span>{{ o.label }}
              </button>
            </div>

            <div v-else-if="q.type === 'multi'" class="opt-list">
              <button
                v-for="o in q.options"
                :key="o.value"
                class="opt"
                :class="{ 'opt--on': answers[q.id].includes(o.value) }"
                @click="toggleMulti(q, o.value)"
              >
                <span class="opt__box"></span>{{ o.label }}
              </button>
            </div>

            <ul v-else-if="q.type === 'rank'" class="rank-list">
              <li v-for="(v, i) in answers[q.id]" :key="v">
                <span class="rank-list__no">{{ i + 1 }}</span>
                <span class="rank-list__label">{{ labelOf(q, v) }}</span>
                <button :disabled="i === 0" @click="moveRank(i, -1)">↑</button>
                <button :disabled="i === answers[q.id].length - 1" @click="moveRank(i, 1)">↓</button>
              </li>
            </ul>

            <div v-else-if="q.type === 'number'" class="num">
              <input v-model.number="answers[q.id]" type="number" :min="q.min" :max="q.max" :step="q.step" />
              <span>元 / 月</span>
            </div>

            <div v-else-if="q.type === 'slider'" class="num">
              <input v-model.number="answers[q.id]" type="range" :min="q.min" :max="q.max" :step="q.step" />
              <strong>{{ answers[q.id] }}</strong>
            </div>

            <textarea
              v-else-if="q.type === 'text'"
              v-model="answers[q.id]"
              :maxlength="q.maxlength"
              rows="4"
              placeholder="选填，可写下任何建议"
            ></textarea>

            <p v-if="errors[q.id]" class="survey-q__err">{{ errors[q.id] }}</p>
          </article>
        </template>

        <template v-else>
          <div class="result-summary">
            <span>共 <b>{{ result.total }}</b> 个点位参与 · 筛选后剩 <b>{{ result.matched }}</b> 个</span>
            <span v-for="w in weightList" :key="w.key">{{ w.label }} {{ w.value }}%</span>
          </div>
          <p v-if="result.relaxed.length" class="result-relax">结果为凑满 5 个，已放宽：{{ result.relaxed.join('、') }}</p>

          <div class="result-tabs">
            <button
              v-for="t in BOARD_TABS"
              :key="t.key"
              :class="{ 'is-on': board === t.key }"
              @click="board = t.key"
            >
              {{ t.label }}
            </button>
          </div>

          <article v-for="item in boardItems" :key="item.name" class="reco">
            <header class="reco__head">
              <span class="reco__rank">{{ item.rank }}</span>
              <div class="reco__title">
                <h4>{{ item.name }}</h4>
                <p>{{ item.profile.city }} · {{ item.profile.county }} · {{ item.profile.scene }}</p>
              </div>
              <strong class="reco__score">{{ Math.round(item.final) }}</strong>
            </header>

            <div class="reco__bars">
              <div v-for="k in WEIGHT_KEYS" :key="k">
                <span>{{ DIM_LABEL[k] }}</span>
                <i><b :style="{ width: item.scores[k] + '%' }"></b></i>
                <em>{{ Math.round(item.scores[k]) }}</em>
              </div>
            </div>

            <ul class="reco__reasons">
              <li v-for="r in item.reasons" :key="r">{{ r }}</li>
            </ul>

            <a v-if="item.url" class="reco__link" :href="item.url" target="_blank" rel="noopener">查看详情 →</a>
          </article>
        </template>
      </div>

      <footer class="survey-foot">
        <template v-if="!isResults">
          <button class="btn-ghost" :disabled="step === 0" @click="step -= 1">上一步</button>
          <span v-if="errorMsg" class="survey-foot__err">{{ errorMsg }}</span>
          <button class="btn-primary" @click="goNext">
            {{ step === STEPS.length - 1 ? '生成推荐' : '下一步' }}
          </button>
        </template>
        <template v-else>
          <button class="btn-ghost" @click="restart">重新填写</button>
          <button class="btn-primary" @click="openOnMap">在地图上查看</button>
        </template>
      </footer>
    </div>
  </div>
</template>
