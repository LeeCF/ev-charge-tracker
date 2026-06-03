<template>
  <div class="view">
    <header class="page-header">
      <span class="page-title">充电历史</span>
    </header>

    <div class="content">
      <div v-if="records.length === 0" class="empty-state">
        暂无充电记录
      </div>
      <RecordItem
        v-for="record in records"
        :key="record.id"
        :record="record"
        @delete="recordsStore.deleteRecord($event)"
      />
    </div>

    <FabButton @click="showSheet = true" />
    <AddRecordSheet v-model:visible="showSheet" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import RecordItem from '../components/RecordItem.vue'
import FabButton from '../components/FabButton.vue'
import AddRecordSheet from '../components/AddRecordSheet.vue'
import { useRecordsStore } from '../stores/records.js'

const showSheet = ref(false)
const recordsStore = useRecordsStore()
const records = computed(() => recordsStore.sortedRecords)
</script>

<style scoped>
.view { min-height: 100%; }

.page-header { padding: 16px 16px 8px; }

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.content { padding: 8px 16px 80px; }

.empty-state {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 60px 0;
  font-size: 15px;
}
</style>
