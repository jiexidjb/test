<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ScopeText from '../components/ScopeText.vue'
import { CITIES } from '../data/cities'
import { useYunnanMap } from '../composables/useYunnanMap'

const props = defineProps({
  mini: { type: Boolean, default: false }
})

const router = useRouter()

const { mapEl, loading, activeCity, cityCounts, visiblePlaces, init, selectCity, reset, focusPlace, total } =
  useYunnanMap()

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

onMounted(() => init())
</script>

<template>
  <div class="map-view" :class="{ 'map-view--mini': props.mini }">
    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
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
        <span class="sidebar__chevron" aria-hidden="true">▾</span>
      </div>

      <div class="sidebar__body">
        <div class="search">
          <span class="search__icon">🔍</span>
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
          <span class="stage__hint">
            {{ summary.count }} 个旅居点<i class="stage__hint-more"> · 右键地图或点击按钮返回全省</i>
          </span>
        </div>
        <button v-if="activeCity" class="ghost-btn" @click.stop="reset">← 返回全省</button>
        <span class="stage__chevron" aria-hidden="true">▾</span>
      </div>

      <div class="stage__canvas">
        <div ref="mapEl" class="map-canvas"></div>
        <div v-if="loading" class="map-loading">
          <span class="map-loading__spinner"></span>
          正在加载云南地图数据…
        </div>
        <button v-if="props.mini" class="map-expand" @click="router.push({ name: 'map' })">⤢ 展开地图</button>
      </div>
    </section>
  </div>
</template>
