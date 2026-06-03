<template>
  <div class="view">
    <header class="page-header">
      <div class="header-title-group">
        <span class="header-eyebrow">充电助手</span>
        <span class="page-title">{{ vehicleName || '我的爱车' }}</span>
      </div>
      <div class="header-badge">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <rect x="2" y="6" width="14" height="9" rx="2"/>
          <path d="M16 9.5h1.5a.5.5 0 0 1 0 3H16"/>
          <rect x="4" y="8" width="9" height="5" rx="1" fill="currentColor" stroke="none"/>
        </svg>
      </div>
    </header>

    <div class="content">
      <CountdownCard />
      <LastRecordCard />
    </div>

    <FabButton @click="showSheet = true" />
    <AddRecordSheet v-model:visible="showSheet" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CountdownCard from '../components/CountdownCard.vue'
import LastRecordCard from '../components/LastRecordCard.vue'
import FabButton from '../components/FabButton.vue'
import AddRecordSheet from '../components/AddRecordSheet.vue'
import { useSettingsStore } from '../stores/settings.js'

const showSheet = ref(false)
const settings = useSettingsStore()
const vehicleName = computed(() => settings.vehicleName)
</script>

<style scoped>
.view { min-height: 100%; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 12px;
}

.header-title-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.header-eyebrow {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.header-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.header-badge svg {
  width: 22px;
  height: 22px;
}

.content { padding: 4px 16px calc(80px + env(safe-area-inset-bottom, 0px)); }
</style>
