import { createRouter, createWebHashHistory } from 'vue-router'
import MapView from '../views/MapView.vue'
import PaperView from '../views/PaperView.vue'

const routes = [
  { path: '/', name: 'map', component: MapView, meta: { title: '旅居地图' } },
  { path: '/papers', name: 'papers', component: PaperView, meta: { title: '学术资源库' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})
