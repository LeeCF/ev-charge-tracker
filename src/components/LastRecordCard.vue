<template>
  <div v-if="record" class="card">
    <div class="card-label">上次充电</div>
    <div class="record-row">
      <div class="tags">
        <span class="tag tag--type">{{ typeLabel }}</span>
        <span class="tag" :class="record.isFull ? 'tag--full' : 'tag--partial'">
          {{ record.isFull ? '满充 100%' : `非满充 ${record.endSoc}%` }}
        </span>
      </div>
      <span class="record-date">{{ record.date }}</span>
    </div>
    <div v-if="record.location" class="record-location">📍 {{ record.location }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRecordsStore } from '../stores/records.js'

const records = useRecordsStore()
const record = computed(() => records.sortedRecords[0] ?? null)

const typeLabels = { slow: '慢充', fast: '快充', superfast: '超快充' }
const typeLabel = computed(() => typeLabels[record.value?.type] ?? '')
</script>

<style scoped>
.card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
  margin-bottom: 12px;
}

.card-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}

.record-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.tags { display: flex; gap: 6px; flex-wrap: wrap; }

.tag {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 20px;
}

.tag--type { background: #f1f5f9; color: var(--color-text-secondary); }
.tag--full { background: var(--color-primary-light); color: var(--color-primary-text); }
.tag--partial { background: #f1f5f9; color: var(--color-text-secondary); }

.record-date {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.record-location {
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
