<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import MapView from './views/MapView.vue'
import PaperView from './views/PaperView.vue'

const route = useRoute()
const isPapers = computed(() => route.name === 'papers')
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="workspace" :class="{ 'workspace--papers': isPapers }">
      <div class="workspace__map">
        <MapView :mini="isPapers" />
      </div>
      <div class="workspace__papers">
        <PaperView />
      </div>
    </main>
  </div>
</template>
