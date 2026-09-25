<script setup>
import { computed, ref } from 'vue'
import AppFooter from '../components/AppFooter.vue'
import { EXTRA_MEDIA, PAPERS, PAPER_CATEGORIES } from '../data/papers'

const activeKey = ref(PAPER_CATEGORIES[0].key)
const keyword = ref('')

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
      <span class="hero__badge">📄 学术研究资源库</span>
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
        <span class="tab__icon">{{ cat.icon }}</span>{{ cat.label }}
      </button>
    </div>

    <div class="search search--wide">
      <span class="search__icon">🔍</span>
      <input v-model="keyword" type="search" placeholder="按标题或作者搜索，如 郑功成" />
    </div>

    <div class="paper-grid">
      <a
        v-for="(item, i) in list"
        :key="`${item.title}-${i}`"
        class="paper-card"
        :style="{ '--i': i }"
        :href="item.src"
        target="_blank"
        rel="noopener"
      >
        <span class="paper-card__tag">{{ item.type === 'pdf' ? 'PDF' : '图片' }}</span>
        <h3>{{ item.title }}</h3>
        <span class="paper-card__action">{{ item.type === 'pdf' ? '在线阅读' : '查看' }} →</span>
      </a>

      <p v-if="!list.length" class="paper-empty">📭 没有匹配的资料，换个关键词试试</p>
    </div>

    <AppFooter />
  </div>
</template>
