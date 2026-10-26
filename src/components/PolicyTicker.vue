<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { policyTitle } from '../data/policies'

const props = defineProps({
  files: { type: Array, required: true },
  // 只在资源库页面播放，地图页暂停
  active: { type: Boolean, default: true }
})
const emit = defineEmits(['open'])

const asset = (p) => encodeURI(`${import.meta.env.BASE_URL}${p}`.replace(/\/{2,}/g, '/'))

const items = computed(() =>
  props.files.map((f) => ({
    title: policyTitle(f),
    src: asset(`policies/government/${f}`)
  }))
)

const index = ref(0)
const current = computed(() => items.value[index.value] || null)

const rootEl = ref(null)
const open = ref(false)

// 每条停留时长（毫秒），切换动画 0.42s
const HOLD = 3800
let timer = null
let paused = false

function stop() {
  if (timer) clearInterval(timer)
  timer = null
}

function start() {
  stop()
  if (!props.active || paused || open.value || items.value.length < 2) return
  timer = setInterval(() => {
    index.value = (index.value + 1) % items.value.length
  }, HOLD)
}

function onEnter() {
  paused = true
  stop()
}

function onLeave() {
  paused = false
  start()
}

function toggle() {
  open.value = !open.value
  if (open.value) stop()
  else start()
}

function pick(item, e) {
  open.value = false
  start()
  emit('open', item, e)
}

function openCurrent(e) {
  if (!current.value) return
  open.value = false
  emit('open', current.value, e)
}

function onDocClick(e) {
  if (open.value && rootEl.value && !rootEl.value.contains(e.target)) open.value = false
}

watch(() => props.active, (v) => {
  if (!v) open.value = false
  start()
}, { immediate: true })

watch(
  () => items.value.length,
  (n) => {
    if (index.value >= n) index.value = 0
    start()
  }
)

watch(open, (v) => {
  if (v) {
    document.addEventListener('click', onDocClick)
  } else {
    document.removeEventListener('click', onDocClick)
  }
})

onBeforeUnmount(() => {
  stop()
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <div ref="rootEl" class="ticker" :class="{ 'ticker--open': open }">
    <div class="ticker__head">
      <p class="ticker__label">最新政策</p>
      <button class="ticker__all" :aria-expanded="open" @click.stop="toggle">
        全部 {{ items.length }}
        <component :is="open ? ArrowDown : ArrowUp" class="ticker__all-icon" />
      </button>
    </div>

    <div class="ticker__viewport" @mouseenter="onEnter" @mouseleave="onLeave">
      <Transition name="ticker-move">
        <button
          v-if="current"
          :key="current.title"
          class="ticker__item"
          :title="current.title"
          @click="openCurrent"
        >
          <span class="ticker__text">{{ current.title }}</span>
        </button>
      </Transition>
    </div>

    <Transition name="ticker-menu">
      <ul v-if="open" class="ticker__menu">
        <li v-for="(item, i) in items" :key="item.title">
          <button class="ticker__menu-item" @click="pick(item, $event)">
            <span class="ticker__menu-no">{{ i + 1 }}</span>
            <span class="ticker__menu-title">{{ item.title }}</span>
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>
