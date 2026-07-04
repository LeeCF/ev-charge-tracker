# EV 充电追踪 App · UI 全面重设计实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 3-Tab 深色风格全面重设计为 2-Tab 活泼×精致风格，包含深海蓝英雄卡、电气蓝主色、扩展 FAB、一屏表单、可视化设置页。

**Architecture:** 以 CSS token 替换为基础，逐组件重写，最后重构路由和 App 壳。HistoryView 拆解后内容迁移至 DashboardView，LastRecordCard 信息整合进摘要卡，FabButton 升级为扩展 FAB。所有 Pinia store 和业务逻辑保持不变。

**Tech Stack:** Vue 3 Composition API、Pinia、Vue Router、CSS custom properties、SVG 动画

---

## 文件改动地图

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/assets/main.css` | 修改 | 替换全部 CSS token |
| `src/App.vue` | 修改 | 2 Tab、Tab 栏样式、slide-fade 过渡 |
| `src/router/index.js` | 修改 | 移除 /history 路由 |
| `src/components/CountdownCard.vue` | 重写 | 深海蓝卡 + SVG 进度环 + 数字翻牌 |
| `src/views/DashboardView.vue` | 重写 | 摘要卡 + 内嵌滚动记录列表 |
| `src/components/FabButton.vue` | 重写 | 扩展 FAB，静止展开/滚动收缩 |
| `src/components/AddRecordSheet.vue` | 重写 | 一屏行内智能表单 |
| `src/views/SettingsView.vue` | 重写 | 可视化电池卡片 + 满充滑块 |
| `src/components/RecordItem.vue` | 修改 | 胶囊标签 + 行高 ≥44px |
| `src/views/HistoryView.vue` | 删除 | 内容已迁移 |
| `src/components/LastRecordCard.vue` | 删除 | 信息整合进 DashboardView |

---

## Task 1: 替换 CSS Token 系统

**Files:**
- Modify: `src/assets/main.css`

- [ ] **Step 1: 用新 token 完整替换 main.css 的 :root 块**

```css
/* src/assets/main.css — 完整替换 :root */
:root {
  /* 主色 — 电气蓝 */
  --color-accent: #0066FF;
  --color-accent-end: #00AAFF;
  --color-accent-light: #E0EDFF;
  --color-accent-text: #0055DD;
  --color-accent-gradient: linear-gradient(135deg, #0055E0 0%, #0088FF 100%);

  /* 英雄卡 */
  --color-hero: linear-gradient(145deg, #0A1E3D 0%, #0D2D5A 60%, #0A3070 100%);

  /* 背景与表面 */
  --color-bg: #F0F6FF;
  --color-surface: #FFFFFF;
  --color-surface-2: #F5F9FF;
  --color-border: #D9ECFF;
  --color-border-strong: #A8CEFF;

  /* 文字层级 */
  --color-text: #061525;
  --color-text-secondary: #7AAAD4;
  --color-text-muted: #B0C8E0;

  /* 功能色 */
  --color-danger: #EF4444;
  --color-danger-bg: #FEF2F2;
  --color-danger-text: #B91C1C;
  --color-success: #16A34A;
  --color-success-bg: #EDFDF4;

  /* 圆角 */
  --radius-hero: 18px;
  --radius-card: 14px;
  --radius-card-sm: 11px;
  --radius-btn: 11px;
  --radius-chip: 20px;
  --radius-fab: 16px;
  --radius-fab-extended: 28px;

  /* 阴影 */
  --shadow-card: 0 2px 14px rgba(0, 40, 120, 0.08);
  --shadow-card-sm: 0 1px 6px rgba(0, 40, 120, 0.05);
  --shadow-fab: 0 4px 20px rgba(0, 102, 255, 0.42);
  --shadow-tab: 0 -1px 0 rgba(0, 40, 120, 0.06), 0 -4px 16px rgba(0, 40, 120, 0.04);

  /* 字体 */
  --font-display: 'Syne', 'PingFang SC', sans-serif;
  --font-body: 'DM Sans', 'PingFang SC', 'Helvetica Neue', sans-serif;
}

html, body, #app {
  height: 100%;
  font-family: var(--font-body);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
  font-size: inherit;
  -webkit-tap-highlight-color: transparent;
}

input, textarea {
  font-family: inherit;
  font-size: inherit;
}

* { scroll-behavior: smooth; }
```

- [ ] **Step 2: 验证 token 替换正确**

```bash
cd "c:/Users/I528850/CC Projects/Project 1_EV Charge Tracker"
npm run dev
```

在浏览器打开，页面背景应变为浅天蓝 `#F0F6FF`，强调色变为电气蓝 `#0066FF`。

- [ ] **Step 3: Commit**

```bash
git add src/assets/main.css
git commit -m "style: 替换 CSS token 为电气蓝+深海蓝体系"
```

---

## Task 2: 重写 CountdownCard

**Files:**
- Modify: `src/components/CountdownCard.vue`

- [ ] **Step 1: 完整重写 CountdownCard.vue**

```vue
<template>
  <div class="hero-card">
    <!-- 右上角光晕装饰 -->
    <div class="hero-glow" aria-hidden="true" />

    <div class="hero-content">
      <!-- 左侧：标签 + 大数字 + 底部信息 -->
      <div class="hero-left">
        <div class="hero-eyebrow">距满充还有</div>
        <div class="hero-number-wrap">
          <span class="hero-number" :key="displayDays">{{ Math.abs(displayDays) }}</span>
          <span class="hero-unit">天</span>
        </div>
        <div class="hero-meta">
          <span class="hero-chip">{{ batteryLabel }}</span>
          <span class="hero-chip">{{ intervalDays }}天周期</span>
        </div>
      </div>

      <!-- 右侧：SVG 进度环 -->
      <div class="hero-ring" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle
            cx="32" cy="32" r="26"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            stroke-width="5"
          />
          <circle
            cx="32" cy="32" r="26"
            fill="none"
            stroke="url(#ring-gradient)"
            stroke-width="5"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 32 32)"
            class="ring-progress"
          />
          <defs>
            <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0066FF" />
              <stop offset="100%" stop-color="#00AAFF" />
            </linearGradient>
          </defs>
        </svg>
        <div class="ring-label">{{ progress }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRecordsStore } from '../stores/records.js'
import { useSettingsStore } from '../stores/settings.js'

const records = useRecordsStore()
const settings = useSettingsStore()

const displayDays = computed(() => records.daysUntilNextFullCharge ?? 0)
const progress = computed(() => records.progressPercent)
const intervalDays = computed(() => settings.fullChargeIntervalDays)

const batteryLabels = { lfp: '磷酸铁锂', nmc: '三元锂', custom: '自定义' }
const batteryLabel = computed(() => batteryLabels[settings.batteryType] ?? '磷酸铁锂')

const circumference = 2 * Math.PI * 26  // ≈ 163.4
const dashOffset = computed(() =>
  circumference * (1 - Math.min(progress.value, 100) / 100)
)
</script>

<style scoped>
.hero-card {
  background: var(--color-hero);
  border-radius: var(--radius-hero);
  padding: 18px 16px;
  margin: 0 0 10px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 32px rgba(10, 30, 60, 0.22);
}

.hero-glow {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 130px;
  height: 130px;
  background: radial-gradient(circle, rgba(0,102,255,0.28), transparent 65%);
  pointer-events: none;
}

.hero-content {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  position: relative;
}

.hero-left { flex: 1; }

.hero-eyebrow {
  font-size: 10px;
  color: rgba(255,255,255,0.38);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-family: var(--font-body);
}

.hero-number-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 12px;
  overflow: hidden;
}

.hero-number {
  font-size: 64px;
  font-weight: 800;
  color: white;
  line-height: 1;
  letter-spacing: -4px;
  font-family: var(--font-display);
  animation: slot-in 0.4s ease-in-out;
}

.hero-unit {
  font-size: 18px;
  color: rgba(255,255,255,0.45);
  font-weight: 400;
  margin-bottom: 6px;
}

.hero-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.hero-chip {
  background: rgba(0,102,255,0.18);
  border: 1px solid rgba(0,102,255,0.28);
  border-radius: var(--radius-chip);
  padding: 3px 10px;
  font-size: 10px;
  color: rgba(180,220,255,0.9);
  font-weight: 500;
}

.hero-ring {
  position: relative;
  flex-shrink: 0;
  margin-bottom: 4px;
}

.ring-progress {
  transition: stroke-dashoffset 0.6s ease;
}

.ring-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.55);
}

@keyframes slot-in {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
</style>
```

- [ ] **Step 2: 验证组件渲染**

运行 `npm run dev`，首页英雄卡应显示深海蓝渐变背景、大白数字、右侧 SVG 进度环、左下角两个胶囊标签。

- [ ] **Step 3: Commit**

```bash
git add src/components/CountdownCard.vue
git commit -m "feat: CountdownCard 重写 — 深海蓝+SVG进度环+数字翻牌"
```

---

## Task 3: 重写 DashboardView（含内嵌滚动记录）

**Files:**
- Modify: `src/views/DashboardView.vue`

- [ ] **Step 1: 完整重写 DashboardView.vue**

```vue
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
          <div class="summary-label">上次充电</div>
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
          <div class="summary-label">本月花费</div>
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
        <div class="record-fade" :class="{ hidden: scrolledToBottom }" />
      </div>
    </div>

    <AddRecordSheet v-model:visible="showSheet" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CountdownCard from '../components/CountdownCard.vue'
import RecordItem from '../components/RecordItem.vue'
import AddRecordSheet from '../components/AddRecordSheet.vue'
import { useRecordsStore } from '../stores/records.js'
import { useSettingsStore } from '../stores/settings.js'

const showSheet = ref(false)
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
const thisMonth = new Date().toISOString().slice(0, 7)
const lastMonth = (() => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 7)
})()
const currentMonthCost = computed(() => {
  const item = recordsStore.monthlyCosts.find(m => m.label === thisMonth)
  return item?.total ?? null
})
const costDiff = computed(() => {
  if (currentMonthCost.value == null) return null
  const prev = recordsStore.monthlyCosts.find(m => m.label === lastMonth)
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
  font-size: 9px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.summary-number {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1;
  letter-spacing: -0.5px;
  font-family: var(--font-display);
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
```

- [ ] **Step 2: 验证首页渲染**

运行 `npm run dev`，首页应显示：英雄卡 → 2列摘要卡 → 内嵌滚动记录列表，无历史 Tab 入口。

- [ ] **Step 3: Commit**

```bash
git add src/views/DashboardView.vue
git commit -m "feat: DashboardView 重写 — 摘要卡+内嵌滚动记录"
```

---

## Task 4: 重写扩展 FAB

**Files:**
- Modify: `src/components/FabButton.vue`

- [ ] **Step 1: 完整重写 FabButton.vue**

```vue
<template>
  <button class="fab" :class="{ collapsed: isCollapsed }" @click="$emit('click')">
    <svg class="fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    <span class="fab-label">记录充电</span>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineEmits(['click'])

const isCollapsed = ref(false)
let scrollTarget = null

function onScroll() {
  isCollapsed.value = (scrollTarget?.scrollTop ?? 0) > 60
}

onMounted(() => {
  // 监听 .app-content 的滚动（App.vue 中的主滚动容器）
  scrollTarget = document.querySelector('.app-content')
  scrollTarget?.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  scrollTarget?.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.fab {
  position: fixed;
  right: 16px;
  bottom: calc(49px + 16px + env(safe-area-inset-bottom, 0px));
  height: 52px;
  background: var(--color-accent-gradient);
  border: none;
  border-radius: var(--radius-fab-extended);
  color: white;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  box-shadow: var(--shadow-fab);
  cursor: pointer;
  z-index: 50;
  transition:
    border-radius 0.3s cubic-bezier(0.4,0,0.2,1),
    width 0.3s cubic-bezier(0.4,0,0.2,1),
    padding 0.3s cubic-bezier(0.4,0,0.2,1);
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}

.fab:active {
  transform: scale(0.96);
  transition: transform 0.08s ease;
  box-shadow: 0 2px 10px rgba(0, 82, 212, 0.3);
}

.fab-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.fab-label {
  overflow: hidden;
  max-width: 80px;
  transition: max-width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s;
}

/* 收缩态：变为圆角方形 */
.fab.collapsed {
  border-radius: var(--radius-fab);
  padding: 0;
  width: 52px;
  justify-content: center;
}

.fab.collapsed .fab-label {
  max-width: 0;
  opacity: 0;
}
</style>
```

- [ ] **Step 2: 验证 FAB 行为**

在 `npm run dev` 中：
- 静止时应显示「记录充电」扩展胶囊
- 向下滚动超过 60px 后应收缩为圆角方形「+」
- 点击后应弹出 AddRecordSheet

- [ ] **Step 3: Commit**

```bash
git add src/components/FabButton.vue
git commit -m "feat: FabButton 升级为扩展 FAB — 静止展开/滚动收缩"
```

---

## Task 5: 重写 AddRecordSheet（一屏智能表单）

**Files:**
- Modify: `src/components/AddRecordSheet.vue`

- [ ] **Step 1: 完整重写 AddRecordSheet.vue**

```vue
<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="visible" class="sheet-overlay" @click.self="close">
        <Transition name="sheet-slide">
          <div v-if="visible" class="sheet">
            <!-- 拖拽条 -->
            <div class="sheet-handle" />

            <!-- 标题 -->
            <div class="sheet-title">添加充电记录</div>

            <!-- 表单 -->
            <div class="sheet-body">

              <!-- 日期行 -->
              <div class="form-row">
                <span class="form-label">日期</span>
                <input type="date" class="form-date" v-model="form.date" />
              </div>

              <!-- 充电类型 -->
              <div class="form-row form-row--col">
                <span class="form-label">充电类型</span>
                <div class="type-group">
                  <button
                    v-for="t in chargeTypes"
                    :key="t.value"
                    class="type-btn"
                    :class="{ active: form.type === t.value }"
                    @click="form.type = t.value"
                  >{{ t.label }}</button>
                </div>
              </div>

              <!-- 满充行 -->
              <div class="form-row">
                <span class="form-label">满充</span>
                <div class="toggle" :class="{ on: form.isFull }" @click="form.isFull = !form.isFull">
                  <div class="toggle-thumb" />
                </div>
              </div>

              <!-- 结束电量（非满充时显示） -->
              <Transition name="field-fade">
                <div v-if="!form.isFull" class="form-row">
                  <span class="form-label">电量 <span class="form-hint">选填</span></span>
                  <div class="soc-row">
                    <input type="number" class="form-input-sm" v-model.number="form.endSoc" min="1" max="99" />
                    <span class="form-unit">%</span>
                  </div>
                </div>
              </Transition>

              <!-- 地点 -->
              <div class="form-row form-row--col">
                <span class="form-label">地点 <span class="form-hint">选填</span></span>
                <div class="location-area">
                  <div v-if="recentLocations.length" class="chips">
                    <button
                      v-for="loc in recentLocations"
                      :key="loc"
                      class="chip"
                      :class="{ active: form.location === loc }"
                      @click="form.location = form.location === loc ? '' : loc"
                    >{{ loc }}</button>
                  </div>
                  <input
                    type="text"
                    class="form-input"
                    v-model="form.location"
                    placeholder="输入其他地点…"
                  />
                </div>
              </div>

              <!-- 费用行 -->
              <div class="form-row">
                <span class="form-label">电费 <span class="form-hint">选填</span></span>
                <div class="cost-row">
                  <span class="form-unit">¥</span>
                  <input type="number" class="form-input-sm" v-model.number="form.cost" min="0" step="0.01" placeholder="0.00" />
                </div>
              </div>

              <!-- 备注行 -->
              <div class="form-row form-row--col">
                <span class="form-label">备注 <span class="form-hint">选填</span></span>
                <input type="text" class="form-input" v-model="form.note" placeholder="如：充电桩故障中途停充" />
              </div>

            </div>

            <!-- 保存按钮 -->
            <div class="sheet-footer">
              <button class="btn-save" :disabled="!isValid" @click="submit">
                保存记录
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRecordsStore } from '../stores/records.js'

defineProps({ visible: Boolean })
const emit = defineEmits(['update:visible'])

const recordsStore = useRecordsStore()
const recentLocations = computed(() => recordsStore.recentLocations)

const chargeTypes = [
  { value: 'slow',      label: '慢充' },
  { value: 'fast',      label: '快充' },
  { value: 'superfast', label: '超快充' },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const form = reactive({
  date: todayStr(),
  type: '',
  isFull: false,
  endSoc: 80,
  cost: null,
  location: '',
  note: '',
})

const isValid = computed(() => form.date && form.type)

function close() {
  emit('update:visible', false)
  Object.assign(form, {
    date: todayStr(), type: '', isFull: false,
    endSoc: 80, cost: null, location: '', note: '',
  })
}

function submit() {
  if (!isValid.value) return
  recordsStore.addRecord({ ...form })
  close()
}
</script>

<style scoped>
.sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.sheet {
  background: var(--color-surface);
  border-radius: 22px 22px 0 0;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  margin: 10px auto 0;
  flex-shrink: 0;
}

.sheet-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  padding: 14px 18px 10px;
  flex-shrink: 0;
}

.sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 18px;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.sheet-footer {
  padding: 12px 18px calc(12px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
  border-top: 1px solid var(--color-border);
}

/* 表单行 */
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
  gap: 12px;
  min-height: 44px;
}

.form-row--col {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.form-row:last-child { border-bottom: none; }

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  flex-shrink: 0;
}

.form-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  font-weight: 400;
  margin-left: 4px;
}

.form-input {
  width: 100%;
  background: var(--color-surface-2);
  border: 1.5px solid var(--color-border);
  border-radius: 9px;
  padding: 9px 12px;
  font-size: 14px;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0,102,255,0.12);
}

.form-input-sm {
  width: 80px;
  background: var(--color-surface-2);
  border: 1.5px solid var(--color-border);
  border-radius: 9px;
  padding: 8px 10px;
  font-size: 14px;
  color: var(--color-text);
  outline: none;
  text-align: right;
}

.form-input-sm:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0,102,255,0.12);
}

.form-date {
  background: var(--color-surface-2);
  border: 1.5px solid var(--color-border);
  border-radius: 9px;
  padding: 8px 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent);
  outline: none;
}

.form-unit {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 充电类型按钮组 */
.type-group {
  display: flex;
  gap: 7px;
  width: 100%;
}

.type-btn {
  flex: 1;
  padding: 10px 0;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-btn);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface-2);
  transition: all 0.15s;
  min-height: 44px;
}

.type-btn.active {
  background: var(--color-accent-gradient);
  border-color: transparent;
  color: white;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,102,255,0.3);
}

/* Toggle */
.toggle {
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background: var(--color-border);
  cursor: pointer;
  position: relative;
  transition: background 0.25s;
  flex-shrink: 0;
}

.toggle.on { background: var(--color-accent-gradient); }

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
}

.toggle.on .toggle-thumb { transform: translateX(20px); }

/* 地点 */
.location-area { width: 100%; display: flex; flex-direction: column; gap: 8px; }

.chips { display: flex; flex-wrap: wrap; gap: 6px; }

.chip {
  padding: 5px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-chip);
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-surface-2);
  min-height: 32px;
  transition: all 0.15s;
}

.chip.active {
  border-color: var(--color-accent);
  background: var(--color-accent-light);
  color: var(--color-accent-text);
  font-weight: 600;
}

/* 费用/SOC 行 */
.cost-row, .soc-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 保存按钮 */
.btn-save {
  width: 100%;
  height: 52px;
  background: var(--color-accent-gradient);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  box-shadow: var(--shadow-fab);
  transition: opacity 0.15s, transform 0.08s;
  letter-spacing: 0.3px;
}

.btn-save:not(:disabled):active { transform: scale(0.98); }
.btn-save:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

/* 过渡动画 */
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.25s; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }

.sheet-slide-enter-active { transition: transform 0.38s cubic-bezier(0.32,0.72,0,1); }
.sheet-slide-leave-active  { transition: transform 0.26s cubic-bezier(0.4,0,1,1); }
.sheet-slide-enter-from, .sheet-slide-leave-to { transform: translateY(100%); }

.field-fade-enter-active, .field-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.field-fade-enter-from, .field-fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
```

- [ ] **Step 2: 验证表单功能**

在 `npm run dev` 中点击 FAB，弹窗应以 spring 曲线弹入，表单字段均可正常输入，充电类型选中后变蓝色渐变，保存后记录出现在列表。

- [ ] **Step 3: Commit**

```bash
git add src/components/AddRecordSheet.vue
git commit -m "feat: AddRecordSheet 重写 — 一屏行内智能表单"
```

---

## Task 6: 重写 SettingsView（可视化设计）

**Files:**
- Modify: `src/views/SettingsView.vue`

- [ ] **Step 1: 完整重写 SettingsView.vue**

```vue
<template>
  <div class="view">
    <header class="page-header">
      <div class="page-title">设置</div>
    </header>

    <div class="content">

      <!-- 车型名称 -->
      <section class="section">
        <div class="section-title">车型名称</div>
        <input
          type="text"
          class="field-input"
          v-model="settings.vehicleName"
          placeholder="如：比亚迪海豹"
        />
      </section>

      <!-- 电池类型可视化选择 -->
      <section class="section">
        <div class="section-title">电池类型</div>
        <div class="battery-grid">
          <button
            v-for="opt in batteryOptions"
            :key="opt.value"
            class="battery-card"
            :class="{ active: settings.batteryType === opt.value }"
            @click="selectBatteryType(opt.value)"
          >
            <div class="battery-icon">{{ opt.icon }}</div>
            <div class="battery-name">{{ opt.label }}</div>
            <div class="battery-days">{{ opt.days ? `${opt.days}天` : '自设' }}</div>
            <div v-if="settings.batteryType === opt.value" class="battery-check">✓</div>
          </button>
        </div>
      </section>

      <!-- 满充间隔可视化滑块 -->
      <section class="section">
        <div class="section-title">满充间隔</div>
        <div class="slider-card">
          <div class="slider-header">
            <span class="slider-label-text">每隔多少天满充一次</span>
            <div class="slider-value">
              <span class="slider-number">{{ settings.fullChargeIntervalDays }}</span>
              <span class="slider-unit">天</span>
            </div>
          </div>
          <input
            type="range"
            class="slider"
            v-model.number="settings.fullChargeIntervalDays"
            min="7"
            max="90"
            :disabled="settings.batteryType !== 'custom'"
          />
          <div class="slider-range">
            <span>7天</span>
            <span>90天</span>
          </div>
          <div v-if="settings.batteryType !== 'custom'" class="slider-locked">
            由电池类型决定，切换至「自定义」可修改
          </div>
        </div>
      </section>

      <!-- 数据管理 -->
      <section class="section section--danger">
        <div class="section-title">数据管理</div>
        <button class="btn-danger" @click="confirmClear">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="2 4 4 4 14 4"/>
            <path d="M13 4l-.7 9a1.5 1.5 0 0 1-1.5 1.4H5.2a1.5 1.5 0 0 1-1.5-1.4L3 4"/>
            <path d="M6.5 4V3a.75.75 0 0 1 .75-.75h1.5A.75.75 0 0 1 9.5 3v1"/>
          </svg>
          清空所有充电记录
        </button>
        <p class="danger-hint">此操作不可撤销</p>
      </section>

    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '../stores/settings.js'
import { useRecordsStore } from '../stores/records.js'

const settings = useSettingsStore()
const recordsStore = useRecordsStore()

const batteryOptions = [
  { value: 'lfp',    label: '磷酸铁锂', days: 14,   icon: '🔋' },
  { value: 'nmc',    label: '三元锂',   days: 30,   icon: '⚡' },
  { value: 'custom', label: '自定义',   days: null, icon: '🔧' },
]

function selectBatteryType(value) {
  settings.batteryType = value
  const opt = batteryOptions.find(o => o.value === value)
  if (opt.days) settings.fullChargeIntervalDays = opt.days
}

function confirmClear() {
  if (window.confirm('确定要清空所有充电记录吗？此操作不可撤销。')) {
    recordsStore.clearAll()
  }
}
</script>

<style scoped>
.view { min-height: 100%; }

.page-header { padding: 16px 16px 12px; }

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.5px;
  font-family: var(--font-display);
}

.content {
  padding: 4px 14px calc(80px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.field-input {
  width: 100%;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-card-sm);
  padding: 11px 14px;
  font-size: 15px;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
}

.field-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0,102,255,0.1);
}

/* 电池卡片网格 */
.battery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.battery-card {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-card-sm);
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.18s;
  position: relative;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.battery-card.active {
  background: var(--color-accent-gradient);
  border-color: transparent;
  box-shadow: 0 3px 12px rgba(0,102,255,0.3);
}

.battery-icon { font-size: 20px; }

.battery-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text);
}
.battery-card.active .battery-name { color: white; }

.battery-days {
  font-size: 10px;
  color: var(--color-text-muted);
}
.battery-card.active .battery-days { color: rgba(255,255,255,0.7); }

.battery-check {
  position: absolute;
  top: 6px;
  right: 7px;
  font-size: 10px;
  color: white;
  font-weight: 700;
}

/* 滑块卡片 */
.slider-card {
  background: var(--color-surface);
  border-radius: var(--radius-card-sm);
  padding: 14px;
  box-shadow: var(--shadow-card-sm);
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.slider-label-text {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.slider-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.slider-number {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-accent);
  font-family: var(--font-display);
  letter-spacing: -0.5px;
}

.slider-unit {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-accent-light);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 2px 8px rgba(0,102,255,0.35);
  border: 3px solid white;
  cursor: pointer;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider-range {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 10px;
  color: var(--color-text-muted);
}

.slider-locked {
  margin-top: 8px;
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: center;
}

/* 危险区 */
.btn-danger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 13px 14px;
  border: 1.5px solid var(--color-danger);
  border-radius: var(--radius-card-sm);
  background: var(--color-surface);
  color: var(--color-danger);
  font-size: 14px;
  font-weight: 600;
  min-height: 48px;
  transition: background 0.15s;
}

.btn-danger:active { background: var(--color-danger-bg); }
.btn-danger svg { width: 16px; height: 16px; flex-shrink: 0; }

.danger-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 6px;
  padding-left: 2px;
}
</style>
```

- [ ] **Step 2: 验证设置页**

在 `npm run dev` 中切换到设置 Tab：
- 电池类型三卡片可点击，选中态变蓝色渐变
- 满充间隔滑块在自定义模式下可拖动，数字实时更新
- 切换电池类型后首页倒计时天数应随之变化

- [ ] **Step 3: Commit**

```bash
git add src/views/SettingsView.vue
git commit -m "feat: SettingsView 重写 — 可视化电池卡片+满充滑块"
```

---

## Task 7: 更新 RecordItem 胶囊样式和行高

**Files:**
- Modify: `src/components/RecordItem.vue`

- [ ] **Step 1: 更新 RecordItem 的 CSS**

仅修改样式，不动交互逻辑。找到 `<style scoped>` 部分，替换以下选择器：

```css
/* 替换 .record-item 的 padding */
.record-item {
  background: var(--color-surface);
  border-radius: var(--radius-card-sm);
  padding: 12px 14px 12px 16px;  /* 确保行高 ≥ 44px */
  box-shadow: var(--shadow-card-sm);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

/* 替换胶囊标签样式 */
.tag {
  font-size: 10px;
  font-weight: 500;
  padding: 3px 9px;
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
.tag--partial {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

/* 更新滑删回弹曲线 */
/* 在 cardStyle computed 中，snapback 的 transition 值已在逻辑里，
   但 CSS transition 回弹部分（rawX.value > 0 分支）使用此值： */
/* transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) — 已在现有代码中 ✓ */

/* 更新 accent-bar 颜色 */
.accent-bar {
  position: absolute;
  left: 0; top: 12%; bottom: 12%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--color-border);
}
.record-item--full .accent-bar { background: var(--color-accent); }
```

- [ ] **Step 2: 验证列表行高**

在 `npm run dev` 中打开充电页，记录列表每行应有足够点击区域（目测行高 ≥ 44px），胶囊标签样式为电气蓝。

- [ ] **Step 3: Commit**

```bash
git add src/components/RecordItem.vue
git commit -m "style: RecordItem 胶囊标签+行高更新"
```

---

## Task 8: 重构 App.vue（2 Tab + slide-fade）

**Files:**
- Modify: `src/App.vue`
- Modify: `src/router/index.js`

- [ ] **Step 1: 更新 router/index.js，移除 /history**

```js
// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  { path: '/',         component: DashboardView },
  { path: '/settings', component: SettingsView },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
```

- [ ] **Step 2: 完整重写 App.vue**

```vue
<template>
  <div class="app-shell">
    <main class="app-content">
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName" mode="out-in">
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
    <FabButton v-if="route.path === '/'" @click="showSheet = true" />
    <AddRecordSheet v-model:visible="showSheet" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import FabButton from './components/FabButton.vue'
import AddRecordSheet from './components/AddRecordSheet.vue'

const showSheet = ref(false)
const route = useRoute()

// Tab 切换方向：/ → /settings 向右，反之向左
const tabOrder = ['/', '/settings']
const transitionName = computed(() => 'slide-fade')
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
```

- [ ] **Step 3: 验证 2 Tab 切换**

在 `npm run dev` 中：
- Tab 栏只有「充电」和「设置」两个入口
- 切换时有 slide-fade 过渡动画
- FAB 只在充电页（`/`）显示，设置页不显示
- 路由 `/history` 不再存在（访问应跳回首页或 404）

- [ ] **Step 4: Commit**

```bash
git add src/App.vue src/router/index.js
git commit -m "feat: App 重构为 2 Tab — 充电+设置，slide-fade 过渡"
```

---

## Task 9: 删除废弃文件

**Files:**
- Delete: `src/views/HistoryView.vue`
- Delete: `src/components/LastRecordCard.vue`

- [ ] **Step 1: 删除 HistoryView.vue**

```bash
rm "src/views/HistoryView.vue"
```

- [ ] **Step 2: 删除 LastRecordCard.vue**

```bash
rm "src/components/LastRecordCard.vue"
```

- [ ] **Step 3: 确认无残留引用**

```bash
grep -r "HistoryView\|LastRecordCard" src/
```

预期输出：无任何匹配。若有匹配则找到该文件并移除对应 import 和使用。

- [ ] **Step 4: 验证构建无报错**

```bash
npm run build
```

预期：Build 成功，无 warning 关于 missing imports。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: 删除 HistoryView 和 LastRecordCard（内容已迁移）"
```

---

## Task 10: 整体验收测试

**Files:** 无新文件，验证整体功能完整性

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 逐项验收**

| 验收项 | 预期结果 |
|--------|---------|
| 首页背景 | 浅天蓝 `#F0F6FF` |
| 英雄卡 | 深海蓝渐变 + 白色大数字 + SVG 圆形进度环 |
| 进场动画 | 英雄卡 → 摘要卡 → 记录区依次 stagger 进入 |
| FAB 静止 | 显示「记录充电」扩展胶囊，电气蓝渐变 |
| FAB 滚动后 | 收缩为圆角方形「+」 |
| 点击 FAB | 弹窗以 spring 曲线弹入 |
| 充电类型选中 | 变蓝色渐变背景 |
| 保存记录 | 弹窗关闭，记录出现在列表 |
| 记录列表 | max-height 固定，内部可滚动，底部有渐变遮罩 |
| 滑删记录 | 滑动露出红色背景，弹回有弹性曲线 |
| Tab 切换 | slide-fade 动画，设置页无 FAB |
| 设置页电池卡片 | 选中态蓝色渐变，✓ 标记 |
| 设置页滑块 | 自定义模式可拖动，数字实时更新 |
| 修改设置 | 首页倒计时天数随之变化 |
| 安全区 | iPhone 底部 home 条不遮挡 Tab 栏 |

- [ ] **Step 3: 构建生产版本**

```bash
npm run build
```

预期：Build 成功，无 error。

- [ ] **Step 4: 最终 Commit**

```bash
git add -A
git commit -m "feat: UI 全面重设计完成 — 2Tab+深海蓝+电气蓝+扩展FAB"
```
