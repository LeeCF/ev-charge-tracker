<template>
  <div class="app-shell">
    <main class="app-content">
      <router-view v-slot="{ Component, route }">
        <transition name="slide-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <nav class="tab-bar">
      <router-link to="/" class="tab-item" active-class="tab-item--active" exact>
        <div class="tab-icon-wrap">
          <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <span class="tab-label">充电</span>
      </router-link>

      <router-link to="/settings" class="tab-item" active-class="tab-item--active">
        <div class="tab-icon-wrap">
          <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <span class="tab-label">设置</span>
      </router-link>
    </nav>

    <!-- 扩展 FAB（只在充电页显示） -->
    <FabButton v-if="route.path === '/'" @click="openAddSheet" />
    <AddRecordSheet
      v-model:visible="showSheet"
      :editRecord="editingRecord"
      @saved="onSheetSaved"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRecordsStore } from './stores/records.js'
import FabButton from './components/FabButton.vue'
import AddRecordSheet from './components/AddRecordSheet.vue'

const showSheet = ref(false)
const editingRecord = ref(null)
const recordsStore = useRecordsStore()
const route = useRoute()

function openAddSheet() {
  editingRecord.value = null
  showSheet.value = true
}

watch(() => recordsStore.editingRecordId, (id) => {
  if (!id) return
  const record = recordsStore.records.find(r => r.id === id)
  if (record) {
    editingRecord.value = { ...record }
    showSheet.value = true
  }
  recordsStore.editingRecordId = null  // always reset, even if record not found
})

function onSheetSaved() {
  editingRecord.value = null
}
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background: var(--color-bg);
  position: relative;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: none;
}

/* Tab 栏 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  background: white;
  box-shadow: var(--shadow-tab);
  height: 49px;
  padding-bottom: env(safe-area-inset-bottom, 0);
  z-index: 100;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: var(--color-text-muted);
  font-size: 10px;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
  padding-top: 4px;
}

.tab-item--active {
  color: var(--color-accent);
}

.tab-item--active::before {
  content: '';
  position: absolute;
  top: 0;
  width: 20px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: var(--color-accent);
}

.tab-icon-wrap {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-icon {
  width: 22px;
  height: 22px;
  transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
}

.tab-item--active .tab-icon {
  transform: scale(1.05);
  stroke: var(--color-accent);
  stroke-width: 2.5;
}

.tab-label { letter-spacing: 0.2px; }
.tab-item--active .tab-label { font-weight: 700; }

/* slide-fade 过渡 */
.slide-fade-enter-active { transition: opacity 0.22s ease-out, transform 0.22s ease-out; }
.slide-fade-leave-active { transition: opacity 0.18s ease-in, transform 0.18s ease-in; }
.slide-fade-enter-from { opacity: 0; transform: translateX(16px); }
.slide-fade-leave-to   { opacity: 0; transform: translateX(-16px); }
</style>
