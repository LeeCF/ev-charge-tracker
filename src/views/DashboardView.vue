<template>
  <div class="view">
    <!-- Header -->
    <header class="page-header">
      <div>
        <div class="header-eyebrow">{{ vehicleName || '我的爱车' }}</div>
        <div class="page-title">充电</div>
      </div>
    </header>

    <div class="content">
      <!-- 英雄卡 -->
      <CountdownCard class="card-anim card-anim-1" />

      <!-- 2列摘要卡 -->
      <div class="summary-grid card-anim card-anim-2">
        <!-- 上次充电 -->
        <div class="summary-card">
          <div class="summary-label">
            <svg class="summary-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 4h14l-1.5 9H2.5L1 4z"/>
              <circle cx="5.5" cy="14" r="1"/>
              <circle cx="10.5" cy="14" r="1"/>
            </svg>
            上次充电
          </div>
          <div class="summary-number">
            {{ daysAgo }}<span class="summary-unit">天前</span>
          </div>
          <div class="summary-tags">
            <span class="tag tag--type">{{ lastTypeLabel }}</span>
            <span v-if="lastRecord?.isFull" class="tag tag--full">满充</span>
          </div>
        </div>
        <!-- 本月花费 -->
        <div class="summary-card">
          <div class="summary-label">
            <svg class="summary-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="8" r="6.5"/>
              <path d="M8 4.5v7M5.5 6.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2c0 2-5 2-5 4 0 1.1.9 2 2.5 2s2.5-.9 2.5-2"/>
            </svg>
            本月花费
          </div>
          <div class="summary-number">
            <span v-if="currentMonthCost != null">¥{{ currentMonthCost.toFixed(0) }}</span>
            <span v-else class="summary-empty">暂无</span>
          </div>
          <div v-if="costDiff != null" class="summary-diff" :class="costDiff <= 0 ? 'diff--down' : 'diff--up'">
            {{ costDiff <= 0 ? '↓' : '↑' }} {{ Math.abs(costDiff) }}%
          </div>
        </div>
      </div>

      <!-- 内嵌可滚动记录列表 -->
      <div class="record-section card-anim card-anim-3">
        <div class="record-section-header">
          <span class="section-label">充电记录</span>
          <span class="section-hint">↕ 可滚动</span>
        </div>

        <div v-if="sortedRecords.length === 0" class="record-empty">
          暂无记录，点击右下角添加
        </div>

        <div v-else class="record-scroll" ref="scrollEl" @scroll="onScroll">
          <RecordItem
            v-for="record in sortedRecords"
            :key="record.id"
            :record="record"
            @delete="recordsStore.deleteRecord($event)"
          />
        </div>

        <!-- 底部渐变遮罩，提示可滚动 -->
        <div class="record-fade" :class="{ hidden: scrolledToBottom || sortedRecords.length === 0 }" />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CountdownCard from '../components/CountdownCard.vue'
import RecordItem from '../components/RecordItem.vue'
import { useRecordsStore } from '../stores/records.js'
import { useSettingsStore } from '../stores/settings.js'

const recordsStore = useRecordsStore()
const settings = useSettingsStore()

const vehicleName = computed(() => settings.vehicleName)
const sortedRecords = computed(() => recordsStore.sortedRecords)

// 上次充电摘要
const lastRecord = computed(() => sortedRecords.value[0] ?? null)
const typeLabels = { slow: '慢充', fast: '快充', superfast: '超快充' }
const lastTypeLabel = computed(() => typeLabels[lastRecord.value?.type] ?? '')
const daysAgo = computed(() => {
  if (!lastRecord.value?.date) return 0
  const diff = Date.now() - new Date(lastRecord.value.date).getTime()
  return Math.max(0, Math.floor(diff / 86400000))
})

// 本月花费
const thisMonth = computed(() => new Date().toISOString().slice(0, 7))
const lastMonth = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 7)
})
const currentMonthCost = computed(() => {
  const item = recordsStore.monthlyCosts.find(m => m.label === thisMonth.value)
  return item?.total ?? null
})
const costDiff = computed(() => {
  if (currentMonthCost.value == null) return null
  const prev = recordsStore.monthlyCosts.find(m => m.label === lastMonth.value)
  if (!prev?.total) return null
  return Math.round(((currentMonthCost.value - prev.total) / prev.total) * 100)
})

// 滚动遮罩
const scrollEl = ref(null)
const scrolledToBottom = ref(false)
function onScroll() {
  const el = scrollEl.value
  if (!el) return
  scrolledToBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 16
}
</script>

<style scoped>
.view { min-height: 100%; }

.page-header {
  padding: 16px 16px 10px;
}

.header-eyebrow {
  font-size: 10px;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.5px;
  font-family: var(--font-display);
}

.content {
  padding: 0 14px calc(120px + env(safe-area-inset-bottom, 0px));
}

/* Stagger 进场动画 */
.card-anim {
  animation: card-in 0.3s ease-out both;
}
.card-anim-1 { animation-delay: 0ms; }
.card-anim-2 { animation-delay: 60ms; }
.card-anim-3 { animation-delay: 120ms; }
@keyframes card-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 摘要卡 */
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.summary-card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 13px 12px;
  box-shadow: var(--shadow-card-sm);
}

.summary-label {
  font-size: 10px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.summary-icon {
  width: 11px;
  height: 11px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.summary-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
  letter-spacing: -0.3px;
  font-family: var(--font-body);
  margin-bottom: 6px;
}

.summary-unit {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 400;
  margin-left: 2px;
  font-family: var(--font-body);
}

.summary-empty {
  font-size: 14px;
  color: var(--color-text-muted);
  font-weight: 400;
  font-family: var(--font-body);
}

.summary-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: var(--radius-chip);
}
.tag--type {
  background: var(--color-surface-2);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.tag--full {
  background: var(--color-accent-light);
  color: var(--color-accent-text);
}

.summary-diff {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-chip);
  display: inline-block;
}
.diff--down { background: var(--color-success-bg); color: var(--color-success); }
.diff--up   { background: var(--color-danger-bg); color: var(--color-danger); }

/* 记录列表区 */
.record-section {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card-sm);
  position: relative;
}

.record-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px 8px;
  border-bottom: 1px solid var(--color-border);
}

.section-label {
  font-size: 10px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.section-hint {
  font-size: 10px;
  color: var(--color-text-muted);
}

.record-empty {
  padding: 28px 14px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
}

.record-scroll {
  max-height: 220px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.record-scroll::-webkit-scrollbar { display: none; }

/* 渐变遮罩 */
.record-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: linear-gradient(to bottom, transparent, var(--color-surface));
  pointer-events: none;
  transition: opacity 0.2s;
}
.record-fade.hidden { opacity: 0; }
</style>
