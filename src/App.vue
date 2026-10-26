<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Bell, Compass } from '@element-plus/icons-vue'
import AppHeader from './components/AppHeader.vue'
import DocViewer from './components/DocViewer.vue'
import PolicyTicker from './components/PolicyTicker.vue'
import SurveyPanel from './components/SurveyPanel.vue'
import { GOVERNMENT_POLICIES } from './data/policies'
import { useOverlay } from './composables/useOverlay'
import MapView from './views/MapView.vue'
import PaperView from './views/PaperView.vue'

// 云南省文化和旅游厅 · 站内「旅居」检索结果
const NEWS_URL =
  'https://dct.yn.gov.cn/irs-c-web/search.shtml?code=198dfd76b56&dataTypeId=296&searchWord=旅居'

const route = useRoute()
const { overlayOpen } = useOverlay()

const isPapers = computed(() => route.name === 'papers')
const surveyOpen = ref(false)
const surveyOrigin = ref(null)

const policyDoc = ref(null)
const policyOrigin = ref(null)

function openSurvey(e) {
  // 记录入口卡片的实际位置，问卷从这里长出来
  surveyOrigin.value = e?.currentTarget?.getBoundingClientRect?.() || null
  surveyOpen.value = true
}

function openPolicy(item, e) {
  policyOrigin.value = e?.currentTarget?.getBoundingClientRect?.() || null
  policyDoc.value = { title: item.title, src: item.src, type: 'pdf' }
}
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="workspace" :class="{ 'workspace--papers': isPapers, 'workspace--modal': overlayOpen }">
      <div class="workspace__map">
        <MapView :mini="isPapers" />
      </div>
      <div class="workspace__papers">
        <PaperView />
      </div>

      <div class="side-tools">
        <PolicyTicker :files="GOVERNMENT_POLICIES" :active="isPapers" @open="openPolicy" />

        <a class="news-link" :href="NEWS_URL" target="_blank" rel="noopener noreferrer">
          <Bell class="news-link__icon" />查看最新旅居政策
        </a>

        <Transition name="entry-fade">
          <button v-if="!surveyOpen" class="survey-entry" @click="openSurvey">
            <Compass class="survey-entry__icon" />
            <span class="survey-entry__title">调查问卷</span>
            <span class="survey-entry__desc">3 分钟帮你看出适合的旅居点</span>
            <span class="survey-entry__cta">开始填写 →</span>
          </button>
        </Transition>
      </div>

      <Teleport to="body">
        <Transition name="doc-fade">
          <DocViewer v-if="policyDoc" :doc="policyDoc" :origin="policyOrigin" @close="policyDoc = null" />
        </Transition>
      </Teleport>

      <Transition name="panel-fade">
        <SurveyPanel v-if="surveyOpen" :origin="surveyOrigin" @close="surveyOpen = false" />
      </Transition>
    </main>
  </div>
</template>
