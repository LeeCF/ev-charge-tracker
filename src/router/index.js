import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import HistoryView from '../views/HistoryView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  { path: '/', component: DashboardView },
  { path: '/history', component: HistoryView },
  { path: '/settings', component: SettingsView },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
