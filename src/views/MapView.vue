<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Close, FullScreen, Search } from '@element-plus/icons-vue'
import ScopeText from '../components/ScopeText.vue'
import { useRecommendedPlaces } from '../composables/useRecommendation'
import { CITIES } from '../data/cities'
import { useYunnanMap } from '../composables/useYunnanMap'
import { BOARD_TABS } from '../utils/recommend'

const props = defineProps({
  mini: { type: Boolean, default: false }
})

const router = useRouter()

const {
  mapEl,
  loading,
  activeCity,
  cityCounts,
  visiblePlaces,
  zoomLevel,
  pointStartZoom,
  init,
  selectCity,
  reset,
  focusPlace,
  showRecommendations,
  clearRecommendations,
  setMapInteractive,
  total
} = useYunnanMap()

const { recommended, recommendation, recommendationBoard, setRecommended, clearRecommended } =
  useRecommendedPlaces()
let pendingReco = null

// 退出推荐模式：按钮与金色标记一起清掉，地图回到普通浏览
function closeReco() {
  clearRecommended()
}

// 切换推荐分类：地图上的金色标记跟着换
function pickBoard(key) {
  recommendationBoard.value = key
  const result = recommendation.value
  if (!result) return
  setRecommended(key === 'overall' ? result.items : result.boards[key] || [])
}

const keyword = ref('')
// 窄屏下默认收起，宽屏由 CSS 强制展开
const sidebarOpen = ref(false)
const barOpen = ref(false)

const filteredCities = computed(() => {
  const kw = keyword.value.trim()
  if (!kw) return CITIES
  return CITIES.filter((c) => c.name.includes(kw) || c.code.includes(kw))
})

const summary = computed(() => ({
  scope: activeCity.value ? activeCity.value.name : '云南省全域',
  count: visiblePlaces.value.length
}))

function pickCity(code) {
  selectCity(code)
}

watch(
  recommended,
  (list) => {
    pendingReco = list
    if (list.length) showRecommendations(list)
    else clearRecommendations()
  },
  { immediate: true }
)

// 缩略图模式下关闭拖动 / 滚轮 / 双指，整块地图只作为"展开地图"的入口
watch(
  () => props.mini,
  (mini) => setMapInteractive(!mini),
  { immediate: true }
)

onMounted(async () => {
  await init()
  setMapInteractive(!props.mini)
  // 问卷可能在 init 完成前就点了"在地图上查看"
  if (pendingReco) showRecommendations(pendingReco)
})
</script>

<template>
  <div class="map-view" :class="{ 'map-view--mini': props.mini }">
    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen, 'sidebar--loading': loading }">
      <div
        class="sidebar__head"
        role="button"
        tabindex="0"
        :aria-expanded="sidebarOpen"
        @click="sidebarOpen = !sidebarOpen"
        @keydown.enter.prevent="sidebarOpen = !sidebarOpen"
      >
        <div class="sidebar__title">
          <h2>州市导览</h2>
          <p>点击州市查看当地旅居资源</p>
        </div>
        <span v-if="loading" class="sidebar__status">数据加载中…</span>
        <span v-else class="sidebar__chevron" aria-hidden="true">▾</span>
      </div>

      <div class="sidebar__body">
        <div class="search">
          <Search class="search__icon" />
          <input v-model="keyword" type="search" placeholder="搜索州市，如 大理" />
        </div>

        <button class="overview" :class="{ 'overview--active': !activeCity }" @click="reset">
          <span>全省概览</span>
          <em>{{ total() }}</em>
        </button>

        <ul class="city-list">
          <li v-for="city in filteredCities" :key="city.code">
            <button
              class="city-item"
              :class="{ 'city-item--active': activeCity?.code === city.code }"
              @click="pickCity(city.code)"
            >
              <span class="city-item__dot"></span>
              <span class="city-item__name">{{ city.name }}</span>
              <span class="city-item__count">{{ cityCounts[city.code] ?? 0 }}</span>
            </button>
          </li>
        </ul>

        <div class="place-panel">
          <div class="place-panel__head">
            <ScopeText tag="h3" class="place-panel__title" :text="summary.scope" />
            <span>{{ summary.count }} 个旅居点</span>
          </div>
          <p v-if="zoomLevel < pointStartZoom" class="place-panel__hint">
            <Search class="place-panel__hint-icon" />放大地图后，旅居点会逐个标出
          </p>
          <p v-if="!visiblePlaces.length" class="place-panel__empty">暂无数据</p>
          <ul v-else class="place-panel__list">
            <li v-for="(place, i) in visiblePlaces" :key="`${place.name}-${i}`">
              <button class="place-row" @click="focusPlace(place)">
                <span class="place-row__name">{{ place.name }}</span>
                <span class="place-row__addr">{{ place.addr }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </aside>

    <section class="stage">
      <div class="stage__bar" :class="{ 'stage__bar--open': barOpen }">
        <div
          class="stage__stat"
          role="button"
          tabindex="0"
          :aria-expanded="barOpen"
          @click="barOpen = !barOpen"
          @keydown.enter.prevent="barOpen = !barOpen"
        >
          <ScopeText tag="strong" class="stage__scope" :text="summary.scope" />
        </div>
        <button v-if="activeCity" class="ghost-btn" @click.stop="reset">← 返回全省</button>
        <span class="stage__chevron" aria-hidden="true">▾</span>
      </div>

      <div v-if="recommendation && !props.mini" class="reco-bar">
        <div class="reco-bar__tabs">
          <button
            v-for="t in BOARD_TABS"
            :key="t.key"
            :class="{ 'is-on': recommendationBoard === t.key }"
            @click="pickBoard(t.key)"
          >
            {{ t.label }}
          </button>
        </div>
        <button class="reco-bar__close" aria-label="关闭推荐" @click="closeReco">
          <Close class="reco-bar__close-icon" />
        </button>
      </div>

      <div class="stage__canvas">
        <div ref="mapEl" class="map-canvas"></div>
        <div v-if="loading" class="map-loading">
          <span class="map-loading__spinner"></span>
          正在加载云南地图数据…
        </div>
        <button
          v-if="props.mini"
          class="map-cover"
          aria-label="展开旅居地图"
          @click="router.push({ name: 'map' })"
        >
          <span class="map-cover__hint">点击展开旅居地图</span>
        </button>
        <button v-if="props.mini" class="map-expand" @click="router.push({ name: 'map' })">
          <FullScreen class="map-expand__icon" />展开地图
        </button>
      </div>
    </section>
  </div>
</template>
