<script setup>
import { computed, ref } from 'vue'
import { Connection, FirstAidKit, FolderOpened, Monitor, Search } from '@element-plus/icons-vue'
import AppFooter from '../components/AppFooter.vue'
import DocViewer from '../components/DocViewer.vue'
import { EXTRA_MEDIA, PAPERS, PAPER_CATEGORIES } from '../data/papers'

// 分类图标：与问卷的五个维度保持同一套线性图标风格
const CAT_ICONS = { social: FirstAidKit, infotech: Monitor, platform: Connection }

const activeKey = ref(PAPER_CATEGORIES[0].key)
const keyword = ref('')
const viewing = ref(null)
const docOrigin = ref(null)

function openDoc(item, e) {
  // 记录被点击卡片的实际位置，弹窗从卡片处展开
  docOrigin.value = e?.currentTarget?.getBoundingClientRect?.() || null
  viewing.value = item
}

const stripExt = (name) => name.replace(/\.pdf$/i, '')
// 文件名含中文标点（：、“”、——），这里显式编码，避免部分服务器/浏览器解析失败
const asset = (p) => encodeURI(`${import.meta.env.BASE_URL}${p}`.replace(/\/{2,}/g, '/'))

const currentCategory = computed(() => PAPER_CATEGORIES.find((c) => c.key === activeKey.value))

const list = computed(() => {
  const items = (PAPERS[activeKey.value] || []).map((file) => ({
    title: stripExt(file),
    src: asset(`papers/${file}`),
    type: 'pdf'
  }))
  const extras = activeKey.value === 'infotech' ? EXTRA_MEDIA.map((m) => ({ ...m, src: asset(m.src) })) : []
  const all = [...items, ...extras]
  const kw = keyword.value.trim().toLowerCase()
  return kw ? all.filter((i) => i.title.toLowerCase().includes(kw)) : all
})
</script>

<template>
  <div class="paper-view">
    <section class="hero">
      <h1>旅居养老 · 信息化平台 · 社会保障</h1>
      <p>{{ currentCategory.desc }}</p>
    </section>

    <div class="tabs">
      <button
        v-for="cat in PAPER_CATEGORIES"
        :key="cat.key"
        class="tab"
        :class="{ 'tab--active': activeKey === cat.key }"
        @click="activeKey = cat.key"
      >
        <component :is="CAT_ICONS[cat.key]" class="tab__icon" />{{ cat.label }}
      </button>
    </div>

    <div class="search search--wide">
      <Search class="search__icon" />
      <input v-model="keyword" type="search" placeholder="按标题或作者搜索，如 郑功成" />
    </div>

    <div class="paper-grid">
      <a
        v-for="(item, i) in list"
        :key="`${item.title}-${i}`"
        class="paper-card"
        :style="{ '--i': i }"
        :href="item.src"
        @click.prevent="openDoc(item, $event)"
      >
        <span class="paper-card__tag">{{ item.type === 'pdf' ? 'PDF' : '图片' }}</span>
        <h3>{{ item.title }}</h3>
        <span class="paper-card__action">{{ item.type === 'pdf' ? '在线阅读' : '查看' }} →</span>
      </a>

      <p v-if="!list.length" class="paper-empty">
        <FolderOpened class="paper-empty__icon" />没有匹配的资料，换个关键词试试
      </p>
    </div>

    <AppFooter />

    <!-- 挂到 body：否则会被 .workspace__papers 的堆叠上下文压在地图下面 -->
    <Teleport to="body">
      <Transition name="doc-fade">
        <DocViewer v-if="viewing" :doc="viewing" :origin="docOrigin" @close="viewing = null" />
      </Transition>
    </Teleport>
  </div>
</template>
