import { ref } from 'vue'

// 弹窗是否打开：用于让地图 / 资源库同时后退、缩小
const overlayOpen = ref(false)

export function useOverlay() {
  return {
    overlayOpen,
    openOverlay() {
      overlayOpen.value = true
    },
    closeOverlay() {
      overlayOpen.value = false
    }
  }
}

/**
 * 由触发元素的矩形推算弹窗动画的起点（相对视口中心偏移 + 缩放）。
 * 弹窗始终居中，所以不需要知道它最终尺寸就能定位起点。
 */
export function originVars(rect, modalW, modalH) {
  if (!rect || !modalW || !modalH) return {}
  const scale = Math.max(0.04, Math.min(rect.width / modalW, rect.height / modalH))
  const dx = rect.left + rect.width / 2 - window.innerWidth / 2
  const dy = rect.top + rect.height / 2 - window.innerHeight / 2
  return {
    '--from-x': `${Math.round(dx)}px`,
    '--from-y': `${Math.round(dy)}px`,
    '--from-s': scale.toFixed(3)
  }
}
