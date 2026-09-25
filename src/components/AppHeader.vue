<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const navs = [
  { name: 'map', label: '旅居地图', icon: '🗺️' },
  { name: 'papers', label: '学术资源库', icon: '📚' }
]
const current = computed(() => route.name)
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <div class="brand">
        <span class="brand__mark">云</span>
        <div class="brand__text">
          <strong>云南旅居</strong>
          <small>智慧导览 · 学术资源库</small>
        </div>
      </div>

      <nav class="nav-pills">
        <RouterLink
          v-for="nav in navs"
          :key="nav.name"
          :to="{ name: nav.name }"
          class="nav-pill"
          :class="{ 'nav-pill--active': current === nav.name }"
        >
          <span class="nav-pill__icon">{{ nav.icon }}</span>{{ nav.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
