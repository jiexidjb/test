<script setup>
// 文本切换时的「旧值上滑淡出 / 新值上滑淡入」，离场元素绝对定位，避免布局跳动
defineProps({
  text: { type: String, default: '' },
  tag: { type: String, default: 'span' }
})
</script>

<template>
  <component :is="tag" class="scope-text">
    <Transition name="scope">
      <span :key="text" class="scope-text__item">{{ text }}</span>
    </Transition>
  </component>
</template>
