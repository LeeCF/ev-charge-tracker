<template>
  <div
    class="record-item"
    :class="{ 'record-item--expanded': expanded }"
    @click="expanded = !expanded"
    @contextmenu.prevent="onLongPress"
    @touchstart="startLongPress"
    @touchend="cancelLongPress"
    @touchmove="cancelLongPress"
  >
    <div class="record-main">
      <div class="record-left">
        <span class="record-date">{{ record.date }}</span>
        <div class="tags">
          <span class="tag tag--type">{{ typeLabel }}</span>
          <span class="tag" :class="record.isFull ? 'tag--full' : 'tag--partial'">
            {{ record.isFull ? '满充 100%' : `非满充 ${record.endSoc}%` }}
          </span>
        </div>
      </div>
      <span v-if="record.location" class="record-location">📍 {{ record.location }}</span>
    </div>

    <div v-if="expanded && record.note" class="record-note">
      {{ record.note }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ record: Object })
const emit = defineEmits(['delete'])

const expanded = ref(false)
const typeLabels = { slow: '慢充', fast: '快充', superfast: '超快充' }
const typeLabel = computed(() => typeLabels[props.record.type] ?? '')

let longPressTimer = null

function startLongPress() {
  longPressTimer = setTimeout(onLongPress, 600)
}

function cancelLongPress() {
  clearTimeout(longPressTimer)
}

function onLongPress() {
  if (confirm(`删除 ${props.record.date} 的充电记录？`)) {
    emit('delete', props.record.id)
  }
}
</script>

<style scoped>
.record-item {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 14px 16px;
  margin-bottom: 8px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: box-shadow 0.15s;
}

.record-item:active { box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

.record-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.record-left { flex: 1; }

.record-date {
  display: block;
  font-size: 13px;
  color: var(--color-text-secondary);
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

.record-location {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.record-note {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
