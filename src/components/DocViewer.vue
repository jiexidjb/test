<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { Close, Download, TopRight } from '@element-plus/icons-vue'
import { originVars, useOverlay } from '../composables/useOverlay'

const props = defineProps({
  doc: { type: Object, required: true },
  // 被点击的论文卡片矩形，弹窗从这里长出来
  origin: { type: Object, default: null }
})
const emit = defineEmits(['close'])
const { openOverlay, closeOverlay } = useOverlay()

const modalStyle = computed(() => {
  if (!props.origin) return {}
  const mobile = window.innerWidth <= 980
  const w = mobile ? window.innerWidth : Math.min(1120, window.innerWidth - 44)
  const h = mobile ? window.innerHeight : Math.min(window.innerHeight * 0.88, 940)
  return originVars(props.origin, w, h)
})

function close() {
  closeOverlay()
  emit('close')
}

const isPdf = computed(() => props.doc.type === 'pdf')

// 下载文件名：去掉非法字符，PDF 补回扩展名
const fileName = computed(() => {
  const base = String(props.doc.title || 'document')
    .replace(/[\\/:*?"<>|]/g, '_')
    .slice(0, 80)
  return isPdf.value ? `${base}.pdf` : base
})

function onKey(e) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  openOverlay()
  window.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  closeOverlay()
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="doc-overlay" @click.self="close">
    <div class="doc-modal" :style="modalStyle" role="dialog" aria-modal="true" :aria-label="doc.title">
      <header class="doc-head">
        <div class="doc-head__left">
          <span class="doc-tag" :class="{ 'doc-tag--img': !isPdf }">{{ isPdf ? 'PDF' : '图片' }}</span>
          <h3 class="doc-title">{{ doc.title }}</h3>
        </div>
        <div class="doc-actions">
          <a class="doc-btn" :href="doc.src" :download="fileName"><Download class="doc-btn__icon" />下载</a>
          <a class="doc-btn doc-btn--ghost" :href="doc.src" target="_blank" rel="noopener">
            <TopRight class="doc-btn__icon" />新窗口
          </a>
          <button class="doc-close" aria-label="关闭" @click="close"><Close class="doc-close__icon" /></button>
        </div>
      </header>

      <div class="doc-body">
        <iframe v-if="isPdf" :src="doc.src" :title="doc.title"></iframe>
        <img v-else :src="doc.src" :alt="doc.title" decoding="async" />
      </div>
    </div>
  </div>
</template>
