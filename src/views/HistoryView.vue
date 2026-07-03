<template>
  <div class="view">
    <header class="page-header">
      <span class="page-title">充电历史</span>
    </header>

    <!-- Segmented control -->
    <div class="seg-wrap">
      <div class="seg-ctrl">
        <button class="seg-btn" :class="{ active: tab === 'records' }" @click="tab = 'records'">充电记录</button>
        <button class="seg-btn" :class="{ active: tab === 'stats' }" @click="tab = 'stats'">费用统计</button>
      </div>
    </div>

    <!-- Records panel -->
    <div v-if="tab === 'records'" class="content">
      <div v-if="records.length === 0" class="empty-state">暂无充电记录</div>
      <RecordItem
        v-for="record in records"
        :key="record.id"
        :record="record"
        @delete="recordsStore.deleteRecord($event)"
      />
    </div>

    <!-- Stats panel -->
    <div v-else class="content">
      <div v-if="!monthlyCosts.length" class="empty-state">暂无费用数据<br><span class="empty-hint">添加记录时填写电费即可统计</span></div>

      <template v-else>
        <!-- Yearly total card -->
        <div class="yearly-card">
          <div class="yearly-label">本年累计</div>
          <div class="yearly-total">¥{{ currentYearTotal.toFixed(2) }}</div>
          <div class="yearly-sub">{{ latestYear }} 年 · 共 {{ currentYearCount }} 次充电</div>
        </div>

        <!-- Toggle month / year -->
        <div class="stats-header">
          <span class="stats-title">{{ showYearly ? '年度统计' : '月度明细' }}</span>
          <button class="toggle-btn" @click="showYearly = !showYearly">
            {{ showYearly ? '看月度' : '看年度' }}
          </button>
        </div>

        <div class="stats-card">
          <div v-if="!showYearly">
            <div v-for="item in monthlyCosts" :key="item.label" class="stats-row">
              <span class="stats-lbl">{{ item.label }}</span>
              <span class="stats-val">¥{{ item.total.toFixed(2) }}</span>
            </div>
          </div>
          <div v-else>
            <div v-for="item in yearlyCosts" :key="item.label" class="stats-row">
              <span class="stats-lbl">{{ item.label }} 年</span>
              <span class="stats-val stats-val--lg">¥{{ item.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </template>
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
const tab = ref('records')
const showYearly = ref(false)

const recordsStore = useRecordsStore()
const records = computed(() => recordsStore.sortedRecords)
const monthlyCosts = computed(() => recordsStore.monthlyCosts)
const yearlyCosts = computed(() => recordsStore.yearlyCosts)

// Use most recent year that has cost data, not necessarily the calendar year
const latestYear = computed(() => yearlyCosts.value[0]?.label ?? new Date().getFullYear().toString())
const currentYearTotal = computed(() => yearlyCosts.value[0]?.total ?? 0)
const currentYearCount = computed(() => {
  return records.value.filter(r => r.date?.startsWith(latestYear.value) && r.cost != null).length
})
</script>

<style scoped>
.view { min-height: 100%; display: flex; flex-direction: column; }

.page-header { padding: 20px 20px 12px; flex-shrink: 0; }

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.5px;
  font-family: var(--font-display);
}

/* ── Segmented control ───────────────────────────────────── */
.seg-wrap {
  padding: 0 16px 12px;
  flex-shrink: 0;
}

.seg-ctrl {
  display: flex;
  background: var(--color-border);
  border-radius: 10px;
  padding: 2px;
  gap: 2px;
}

.seg-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.seg-btn.active {
  background: var(--color-surface);
  color: var(--color-accent);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

/* ── Content area ────────────────────────────────────────── */
.content { padding: 0 16px calc(80px + env(safe-area-inset-bottom, 0px)); flex: 1; }

.empty-state {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 60px 0;
  font-size: 15px;
  line-height: 1.7;
}
.empty-hint {
  font-size: 13px;
  color: var(--color-text-muted);
}

/* ── Yearly highlight card ───────────────────────────────── */
.yearly-card {
  background: var(--gradient-hero);
  border-radius: var(--radius-card);
  padding: 18px 20px;
  margin-bottom: 14px;
  color: white;
}

.yearly-label {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.55);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
}

.yearly-total {
  font-size: 34px;
  font-weight: 800;
  color: #6AADFF;
  letter-spacing: -1px;
  line-height: 1.1;
  margin-bottom: 4px;
  font-family: var(--font-display);
}

.yearly-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
}

/* ── Stats section header ────────────────────────────────── */
.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stats-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.toggle-btn {
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 4px 12px;
  font-weight: 500;
  cursor: pointer;
}

/* ── Stats list card ─────────────────────────────────────── */
.stats-card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 4px 16px;
  box-shadow: var(--shadow-card);
  margin-bottom: 12px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 0;
  border-bottom: 1px solid var(--color-border);
}
.stats-row:last-child { border-bottom: none; }

.stats-lbl {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.stats-val {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.stats-val--lg { font-size: 17px; }
</style>
