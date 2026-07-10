<template>
  <div class="view" ref="viewEl">
    <!-- 下拉刷新指示器 -->
    <div class="pull-indicator" :style="{ transform: `translateY(${Math.min(pullDistance, 64) - 44}px)`, opacity: Math.min(pullDistance / 60, 1) }">
      <svg class="pull-spinner" :class="{ spinning: isRefreshing }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
      </svg>
    </div>

    <!-- Header -->
    <header class="page-header">
      <div>
        <div class="header-eyebrow">{{ vehicleName || '我的爱车' }}</div>
        <div class="page-title">充电</div>
      </div>
    </header>

    <div class="content" :style="{ transform: isRefreshing ? 'translateY(48px)' : pullDistance > 0 ? `translateY(${Math.min(pullDistance * 0.4, 24)}px)` : '' , transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' : 'none' }">
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
          <!-- 插画：电动车充电桩 -->
          <svg class="empty-illustration" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 地面 -->
            <rect x="10" y="82" width="100" height="3" rx="1.5" fill="#D9ECFF" opacity="0.6"/>
            <!-- 充电桩主体 -->
            <rect x="42" y="28" width="36" height="54" rx="6" fill="#E0EDFF"/>
            <rect x="42" y="28" width="36" height="54" rx="6" stroke="#A8CEFF" stroke-width="1.5"/>
            <!-- 充电桩屏幕 -->
            <rect x="49" y="36" width="22" height="14" rx="3" fill="#0066FF" opacity="0.15"/>
            <rect x="49" y="36" width="22" height="14" rx="3" stroke="#0066FF" stroke-width="1" opacity="0.4"/>
            <!-- 屏幕闪电图标 -->
            <path d="M61 39.5L59 44h3l-2 4" stroke="#0066FF" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
            <!-- 充电枪插口 -->
            <rect x="51" y="56" width="18" height="10" rx="3" fill="white" stroke="#A8CEFF" stroke-width="1"/>
            <circle cx="60" cy="61" r="2.5" fill="#D9ECFF" stroke="#A8CEFF" stroke-width="0.8"/>
            <!-- 充电线 -->
            <path d="M60 66 Q60 75 45 78 Q32 80 30 82" stroke="#A8CEFF" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="3 2"/>
            <!-- 充电枪头 -->
            <rect x="22" y="76" width="12" height="7" rx="2" fill="#E0EDFF" stroke="#A8CEFF" stroke-width="1"/>
            <!-- 小星星/能量点 -->
            <circle cx="88" cy="38" r="2" fill="#0066FF" opacity="0.25"/>
            <circle cx="92" cy="46" r="1.2" fill="#0066FF" opacity="0.18"/>
            <circle cx="85" cy="50" r="1.5" fill="#0066FF" opacity="0.2"/>
          </svg>
          <div class="empty-title">还没有充电记录</div>
          <div class="empty-desc">点击右下角「记录充电」<br>开始追踪你的充电习惯</div>
        </div>

        <div v-else class="record-scroll" ref="scrollEl" @scroll="onScroll">
          <template v-for="item in groupedRecords" :key="item.type === 'header' ? item.label : item.id">
            <div v-if="item.type === 'header'" class="month-header">{{ item.label }}</div>
            <RecordItem
              v-else
              :record="item"
              :isNew="item.id === newRecordId"
              @pending-delete="onPendingDelete"
              @undo-delete="onUndoDelete"
              @edit="recordsStore.requestEdit($event.id)"
            />
          </template>
        </div>

        <!-- 底部渐变遮罩，提示可滚动 -->
        <div class="record-fade" :class="{ hidden: scrolledToBottom || sortedRecords.length === 0 }" />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import CountdownCard from '../components/CountdownCard.vue'
import RecordItem from '../components/RecordItem.vue'
import { useRecordsStore } from '../stores/records.js'
import { useSettingsStore } from '../stores/settings.js'

const recordsStore = useRecordsStore()
const settings = useSettingsStore()

// ── 下拉刷新 ──────────────────────────────────────────────────────
const viewEl = ref(null)
const pullDistance = ref(0)
const isRefreshing = ref(false)
const PULL_THRESHOLD = 60
let pullStartY = 0
let isPulling = false

function onTouchStart(e) {
  // 找真正的滚动容器：App.vue 的 .app-content
  const scrollable = viewEl.value?.closest('.app-content') ?? document.querySelector('.app-content')
  if (scrollable?.scrollTop > 0) return
  pullStartY = e.touches[0].clientY
  isPulling = true
}

function onTouchMove(e) {
  if (!isPulling || isRefreshing.value) return
  const dy = e.touches[0].clientY - pullStartY
  if (dy > 0) pullDistance.value = dy
}

function onTouchEnd() {
  if (!isPulling) return
  isPulling = false
  if (pullDistance.value >= PULL_THRESHOLD) {
    isRefreshing.value = true
    pullDistance.value = 0
    // 触发 stagger 重新进场
    refreshKey.value++
    setTimeout(() => { isRefreshing.value = false }, 600)
  } else {
    pullDistance.value = 0
  }
}

const refreshKey = ref(0)

// 撤销删除：软删除定时器
let pendingTimers = {}

function onPendingDelete(id) {
  recordsStore.markPendingDelete(id)
  const timer = setTimeout(() => {
    recordsStore.deleteRecord(id)
    delete pendingTimers[id]
  }, 3000)
  pendingTimers[id] = timer
}

function onUndoDelete(id) {
  clearTimeout(pendingTimers[id])
  delete pendingTimers[id]
  recordsStore.restoreRecord(id)
}

onMounted(() => {
  const el = viewEl.value
  if (!el) return
  el.addEventListener('touchstart', onTouchStart, { passive: true })
  el.addEventListener('touchmove', onTouchMove, { passive: true })
  el.addEventListener('touchend', onTouchEnd)
})

onUnmounted(() => {
  const el = viewEl.value
  if (!el) return
  el.removeEventListener('touchstart', onTouchStart)
  el.removeEventListener('touchmove', onTouchMove)
  el.removeEventListener('touchend', onTouchEnd)
  // Clear any pending delete timers to prevent data loss on unmount
  Object.values(pendingTimers).forEach(clearTimeout)
})

// 飞入动画：保存后高亮最新记录
const newRecordId = ref(null)
watch(() => recordsStore.lastAddedId, (id) => {
  if (!id) return
  newRecordId.value = id
  setTimeout(() => { newRecordId.value = null }, 800)
})

const vehicleName = computed(() => settings.vehicleName)
const sortedRecords = computed(() => recordsStore.sortedRecords)

// 月份分组：在记录流中插入月份标题
const groupedRecords = computed(() => {
  const result = []
  let lastMonth = null
  for (const record of sortedRecords.value) {
    const month = record.date?.slice(0, 7) // 'YYYY-MM'
    if (month && month !== lastMonth) {
      const [year, mon] = month.split('-')
      const thisYear = new Date().getFullYear().toString()
      const label = year === thisYear ? `${parseInt(mon)}月` : `${year}年${parseInt(mon)}月`
      result.push({ type: 'header', label, id: `header-${month}` })
      lastMonth = month
    }
    result.push(record)
  }
  return result
})

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
.view { min-height: 100%; position: relative; overflow: hidden; }

/* 下拉刷新指示器 */
.pull-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.pull-spinner {
  width: 22px;
  height: 22px;
  color: var(--color-accent);
}

.pull-spinner.spinning {
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

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
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 400;
  margin-left: 1px;
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
  padding: 28px 14px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-illustration {
  width: 120px;
  height: 100px;
  opacity: 0.85;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.empty-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.month-header {
  padding: 8px 14px 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 1;
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
