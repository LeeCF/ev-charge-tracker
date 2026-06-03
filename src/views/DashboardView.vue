<template>
  <div class="view">
    <header class="page-header">
      <span class="page-title">{{ vehicleName || '充电助手' }}</span>
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
  padding: 16px 16px 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.content { padding: 8px 16px 80px; }
</style>
