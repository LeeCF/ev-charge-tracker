<template>
  <div v-if="record" class="card">
    <div class="card-header">
      <div class="card-label">
        <svg class="label-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3h10l-1 6H4L3 3z"/>
          <circle cx="6" cy="14" r="1"/>
          <circle cx="11" cy="14" r="1"/>
        </svg>
        上次充电
      </div>
      <div class="days-ago">
        <span class="days-num">{{ daysAgo }}</span>
        <span class="days-unit">天前</span>
      </div>
    </div>

    <div class="record-body">
      <div class="record-meta">
        <div class="record-date">{{ record.date }}</div>
        <div class="tags">
          <span class="tag tag--type">{{ typeLabel }}</span>
          <span class="tag" :class="record.isFull ? 'tag--full' : 'tag--partial'">
            {{ record.isFull ? '满充 100%' : `非满充 ${record.endSoc}%` }}
          </span>
        </div>
      </div>
      <div class="record-right">
        <span v-if="record.cost != null" class="record-cost">¥{{ record.cost.toFixed(2) }}</span>
        <span v-if="record.location" class="record-location">
          <svg viewBox="0 0 12 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M6 1C3.24 1 1 3.24 1 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z"/>
            <circle cx="6" cy="6" r="1.5"/>
          </svg>
          {{ record.location }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRecordsStore } from '../stores/records.js'

const records = useRecordsStore()
const record = computed(() => records.sortedRecords[0] ?? null)

const typeLabels = { slow: '慢充', fast: '快充', superfast: '超快充' }
const typeLabel = computed(() => typeLabels[record.value?.type] ?? '')

const daysAgo = computed(() => {
  if (!record.value?.date) return 0
  const diff = Date.now() - new Date(record.value.date).getTime()
  return Math.max(0, Math.floor(diff / 86400000))
})
</script>

<style scoped>
.card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.label-icon { width: 13px; height: 13px; }

/* Days-ago badge */
.days-ago {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.days-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-display);
}
.days-unit {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.record-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.record-meta { flex: 1; }

.record-date {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.tags { display: flex; gap: 6px; flex-wrap: wrap; }

.tag {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: var(--radius-chip);
}

.tag--type {
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.tag--full {
  background: var(--color-accent-light);
  color: var(--color-accent-text);
}
.tag--partial {
  background: var(--color-bg);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.record-cost {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.record-location {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.record-location svg { width: 10px; height: 13px; flex-shrink: 0; }
</style>
