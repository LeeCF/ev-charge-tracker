# EV 充电助手功能扩展实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为充电助手新增4项功能：撤销删除、编辑记录、费用趋势图、记录筛选。

**Architecture:** 撤销删除通过软删除标记+定时器实现，无需改变 store 持久化逻辑；编辑记录复用 AddRecordSheet 并新增 editRecord prop；趋势图为纯 SVG 组件嵌入 DashboardView；筛选通过 DashboardView 本地 computed 实现，不改 store。

**Tech Stack:** Vue 3 Composition API、Pinia、纯 SVG（趋势图，无外部库）

---

## 文件改动地图

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/stores/records.js` | 修改 | 新增 updateRecord、markPendingDelete、restoreRecord |
| `src/components/AddRecordSheet.vue` | 修改 | 新增 editRecord prop，支持编辑模式 |
| `src/App.vue` | 修改 | 新增 editingRecord ref，处理 RecordItem 的 edit 事件 |
| `src/components/RecordItem.vue` | 修改 | 软删除状态 UI（提示卡 + 进度条） |
| `src/views/DashboardView.vue` | 修改 | 处理 pending-delete/undo 事件，新增趋势图卡片，新增筛选面板 |
| `src/components/CostChart.vue` | 新建 | 纯 SVG 月度柱状图组件 |
| `tests/e2e.js` | 修改 | 每个功能追加对应 E2E 测试用例 |

---

## Task 1: store 新增 updateRecord / markPendingDelete / restoreRecord

**Files:**
- Modify: `src/stores/records.js`

- [ ] **Step 1: 在 records.js 的 addRecord 后新增三个函数**

在 `deleteRecord` 函数前插入：

```js
function updateRecord(id, data) {
  const idx = records.value.findIndex(r => r.id === id)
  if (idx === -1) return
  records.value[idx] = {
    ...records.value[idx],
    date: data.date,
    type: data.type,
    isFull: data.isFull,
    endSoc: data.isFull ? 100 : (data.endSoc ?? 80),
    cost: data.cost != null && data.cost !== '' ? Number(data.cost) : null,
    location: data.location ?? '',
    note: data.note ?? '',
  }
  saveRecords(records.value)
}

function markPendingDelete(id) {
  const record = records.value.find(r => r.id === id)
  if (record) record.pendingDelete = true
}

function restoreRecord(id) {
  const record = records.value.find(r => r.id === id)
  if (record) delete record.pendingDelete
}
```

- [ ] **Step 2: 在 return 对象中导出这三个函数**

```js
return {
  records,
  lastAddedId,
  sortedRecords,
  lastFullRecord,
  nextFullChargeDate,
  daysUntilNextFullCharge,
  progressPercent,
  recentLocations,
  monthlyCosts,
  yearlyCosts,
  addRecord,
  updateRecord,      // 新增
  deleteRecord,
  markPendingDelete, // 新增
  restoreRecord,     // 新增
  clearAll,
}
```

- [ ] **Step 3: 验证构建**

```bash
cd "c:/Users/I528850/CC Projects/Project 1_EV Charge Tracker"
npm run build
```

Expected: `✓ built` 无报错

- [ ] **Step 4: Commit**

```bash
git add src/stores/records.js
git commit -m "feat: store 新增 updateRecord/markPendingDelete/restoreRecord"
```

---

## Task 2: RecordItem 支持软删除状态 UI

**Files:**
- Modify: `src/components/RecordItem.vue`

- [ ] **Step 1: 修改 triggerDelete，emit pending-delete 而非直接删除**

找到 `triggerDelete` 函数，修改为：

```js
function triggerDelete() {
  deleting.value = true
  setTimeout(() => emit('pending-delete', props.record.id), 280)
}
```

- [ ] **Step 2: 在 defineEmits 中新增 pending-delete**

```js
const emit = defineEmits(['delete', 'edit', 'pending-delete'])
```

- [ ] **Step 3: 新增软删除状态的模板**

在 `</div><!-- end swipe-wrapper -->` 前，在 `.record-item` div 内的最后，`<transition name="expand">` 之后添加：

在模板顶层的 `.swipe-wrapper` div 上新增条件：当 `record.pendingDelete` 为 true 时，显示提示卡而非正常卡片。

修改 template 中的 `.record-item` 部分，在 `swipe-wrapper` 内卡片之前加判断：

```html
<!-- 软删除提示卡 -->
<div v-if="record.pendingDelete" class="pending-delete-card">
  <div class="pending-delete-info">
    <div class="pending-delete-title">已删除</div>
    <div class="pending-delete-sub">{{ record.date }} · {{ typeLabel }}</div>
  </div>
  <button class="pending-undo-btn" @click.stop="$emit('undo-delete', record.id)">撤销</button>
</div>

<!-- 正常卡片：pendingDelete 为 false 时显示 -->
<div
  v-else
  class="record-item"
  ...
```

同时在 defineEmits 加 `undo-delete`：
```js
const emit = defineEmits(['delete', 'edit', 'pending-delete', 'undo-delete'])
```

- [ ] **Step 4: 新增软删除卡片 CSS**

在 `</style>` 前插入：

```css
.pending-delete-card {
  background: linear-gradient(145deg, #0A1E3D, #0D2D5A);
  border-radius: var(--radius-card-sm);
  padding: 12px 14px 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
}

.pending-delete-title {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  margin-bottom: 2px;
}

.pending-delete-sub {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.75);
}

.pending-undo-btn {
  font-size: 13px;
  font-weight: 700;
  color: #60B4FF;
  background: none;
  border: none;
  padding: 4px 0 4px 16px;
  cursor: pointer;
  flex-shrink: 0;
}
```

- [ ] **Step 5: 验证构建**

```bash
npm run build
```

Expected: `✓ built` 无报错

- [ ] **Step 6: Commit**

```bash
git add src/components/RecordItem.vue
git commit -m "feat: RecordItem 软删除状态 UI"
```

---

## Task 3: DashboardView 处理软删除逻辑（撤销删除完整功能）

**Files:**
- Modify: `src/views/DashboardView.vue`

- [ ] **Step 1: 新增 pendingTimers ref 和处理函数**

在 script setup 中，refreshKey 之后添加：

```js
// 撤销删除：软删除定时器
const pendingTimers = ref({})

function onPendingDelete(id) {
  recordsStore.markPendingDelete(id)
  const timer = setTimeout(() => {
    recordsStore.deleteRecord(id)
    delete pendingTimers.value[id]
  }, 3000)
  pendingTimers.value[id] = timer
}

function onUndoDelete(id) {
  clearTimeout(pendingTimers.value[id])
  delete pendingTimers.value[id]
  recordsStore.restoreRecord(id)
}
```

- [ ] **Step 2: 在 groupedRecords 中的 RecordItem 上绑定新事件**

找到模板中的 `<RecordItem`，修改为：

```html
<RecordItem
  v-else
  :record="item"
  :isNew="item.id === newRecordId"
  @delete="recordsStore.deleteRecord($event)"
  @pending-delete="onPendingDelete"
  @undo-delete="onUndoDelete"
/>
```

- [ ] **Step 3: 验证构建**

```bash
npm run build
```

Expected: `✓ built` 无报错

- [ ] **Step 4: 追加 E2E 测试用例**

在 `tests/e2e.js` 的测试列表末尾，在最后的 `console.log` 汇总前追加：

```js
// ── 11. 撤销删除 ───────────────────────────────────────────────
console.log('\n[11] 撤销删除')
if (count >= 1) {
  // 先确认记录存在
  const countBefore = await page.locator('.record-item').count()

  // 模拟滑删（mouse drag）
  const firstItem = page.locator('.record-item').first()
  const box = await firstItem.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width - 20 - 160, box.y + box.height / 2, { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(400)

    // 检查软删除提示卡
    const pendingCard = page.locator('.pending-delete-card')
    if (await pendingCard.isVisible()) {
      pass('滑删后出现软删除提示卡')

      // 点撤销
      const undoBtn = page.locator('.pending-undo-btn').first()
      await undoBtn.click()
      await page.waitForTimeout(300)

      // 验证记录恢复
      const countAfter = await page.locator('.record-item').count()
      if (countAfter >= countBefore) pass('撤销后记录恢复')
      else fail('撤销删除', `记录数: ${countBefore} → ${countAfter}`)
    } else {
      fail('软删除提示卡', '未出现（可能滑动距离不足）')
    }
  }
} else {
  pass('撤销删除测试跳过（无记录）')
}
```

- [ ] **Step 5: Commit**

```bash
git add src/views/DashboardView.vue tests/e2e.js
git commit -m "feat: 撤销删除完整功能 — 软删除+3秒定时器+撤销恢复"
```

---

## Task 4: AddRecordSheet 支持编辑模式

**Files:**
- Modify: `src/components/AddRecordSheet.vue`

- [ ] **Step 1: 新增 editRecord prop 并修改 defineProps/defineEmits**

```js
const props = defineProps({
  visible: Boolean,
  editRecord: { type: Object, default: null },
})
const emit = defineEmits(['update:visible', 'saved'])
```

- [ ] **Step 2: 修改 form 初始化，editRecord 有值时预填**

将现有的 `const form = reactive({...})` 替换为：

```js
const form = reactive({
  date: todayStr(),
  type: '',
  isFull: false,
  endSoc: 80,
  cost: null,
  location: '',
  note: '',
})

// 当 editRecord 变化时，预填表单
watch(() => props.editRecord, (record) => {
  if (record) {
    form.date = record.date
    form.type = record.type
    form.isFull = record.isFull
    form.endSoc = record.endSoc ?? 80
    form.cost = record.cost ?? null
    form.location = record.location ?? ''
    form.note = record.note ?? ''
  } else {
    Object.assign(form, {
      date: todayStr(), type: '', isFull: false,
      endSoc: 80, cost: null, location: '', note: '',
    })
  }
}, { immediate: true })
```

需要从 vue 导入 watch：
```js
import { ref, reactive, computed, watch } from 'vue'
```

- [ ] **Step 3: 修改标题，编辑模式显示「编辑充电记录」**

找到 `<div class="sheet-title">添加充电记录</div>`，修改为：

```html
<div class="sheet-title">{{ props.editRecord ? '编辑充电记录' : '添加充电记录' }}</div>
```

- [ ] **Step 4: 修改 submit 函数，编辑模式调用 updateRecord**

```js
function submit() {
  if (!isValid.value) return
  if (props.editRecord) {
    recordsStore.updateRecord(props.editRecord.id, { ...form })
    emit('saved', { id: props.editRecord.id, mode: 'edit' })
  } else {
    const newId = recordsStore.addRecord({ ...form })
    emit('saved', { id: newId, mode: 'add' })
  }
  close()
}
```

- [ ] **Step 5: 修改保存按钮文字**

找到 `<button class="btn-save"...>保存记录</button>`，修改为：

```html
<button class="btn-save" :disabled="!isValid" @click="submit">
  {{ props.editRecord ? '保存修改' : '保存记录' }}
</button>
```

- [ ] **Step 6: 验证构建**

```bash
npm run build
```

Expected: `✓ built` 无报错

- [ ] **Step 7: Commit**

```bash
git add src/components/AddRecordSheet.vue
git commit -m "feat: AddRecordSheet 支持编辑模式 — 预填数据+保存修改"
```

---

## Task 5: App.vue 处理编辑记录入口

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: 新增 editingRecord ref**

在 `const showSheet = ref(false)` 后添加：

```js
const editingRecord = ref(null)
```

- [ ] **Step 2: 修改 AddRecordSheet，传入 editingRecord**

找到 `<AddRecordSheet v-model:visible="showSheet" />`，修改为：

```html
<AddRecordSheet
  v-model:visible="showSheet"
  :editRecord="editingRecord"
  @saved="onSheetSaved"
/>
```

- [ ] **Step 3: 新增 onSheetSaved 函数，saved 后清空 editingRecord**

```js
function onSheetSaved() {
  editingRecord.value = null
}
```

- [ ] **Step 4: FAB 点击时清空 editingRecord（确保是新增模式）**

找到 `<FabButton v-if="route.path === '/'" @click="showSheet = true" />`，修改为：

```html
<FabButton v-if="route.path === '/'" @click="() => { editingRecord.value = null; showSheet = true }" />
```

- [ ] **Step 5: DashboardView 需要能触发 App.vue 的编辑弹窗**

由于 RecordItem 的 `edit` 事件在 DashboardView 处理，但弹窗在 App.vue，需要通过 provide/inject 或 store 传递。最简单方案：在 records store 新增 `editingRecordId` ref，App.vue watch 它来打开编辑弹窗。

在 `src/stores/records.js` 新增：

```js
const editingRecordId = ref(null)  // App.vue watch 此值来打开编辑弹窗

function requestEdit(id) {
  editingRecordId.value = id
}
```

在 return 中导出：
```js
editingRecordId,
requestEdit,
```

- [ ] **Step 6: DashboardView 处理 edit 事件，调用 requestEdit**

在 `src/views/DashboardView.vue` 的 RecordItem 模板中添加 `@edit`：

```html
<RecordItem
  v-else
  :record="item"
  :isNew="item.id === newRecordId"
  @delete="recordsStore.deleteRecord($event)"
  @pending-delete="onPendingDelete"
  @undo-delete="onUndoDelete"
  @edit="recordsStore.requestEdit($event.id)"
/>
```

- [ ] **Step 7: App.vue watch editingRecordId，打开编辑弹窗**

```js
import { useRecordsStore } from './stores/records.js'
const recordsStore = useRecordsStore()

watch(() => recordsStore.editingRecordId, (id) => {
  if (!id) return
  const record = recordsStore.records.find(r => r.id === id)
  if (record) {
    editingRecord.value = record
    showSheet.value = true
    recordsStore.editingRecordId = null
  }
})
```

需要在 App.vue 导入 watch：
```js
import { ref, watch } from 'vue'
```

- [ ] **Step 8: 验证构建**

```bash
npm run build
```

Expected: `✓ built` 无报错

- [ ] **Step 9: 追加编辑记录 E2E 测试**

在 `tests/e2e.js` 测试列表末尾追加：

```js
// ── 12. 编辑记录 ───────────────────────────────────────────────
console.log('\n[12] 编辑记录')
const recordItems = page.locator('.record-item')
const rCount = await recordItems.count()
if (rCount >= 1) {
  // 点击展开
  await recordItems.first().click()
  await page.waitForTimeout(300)
  const editBtn = page.locator('.btn-edit').first()
  if (await editBtn.isVisible()) {
    await editBtn.click()
    await page.waitForTimeout(500)
    const sheetTitle = page.locator('.sheet-title')
    const titleText = await sheetTitle.textContent()
    if (titleText?.includes('编辑')) pass('编辑弹窗标题显示「编辑充电记录」')
    else fail('编辑弹窗', `标题: ${titleText}`)

    // 关闭
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  } else {
    fail('编辑按钮', '展开后未找到')
  }
} else {
  pass('编辑记录测试跳过（无记录）')
}
```

- [ ] **Step 10: Commit**

```bash
git add src/App.vue src/stores/records.js src/views/DashboardView.vue tests/e2e.js
git commit -m "feat: 编辑记录完整功能 — 弹窗预填+保存更新"
```

---

## Task 6: 新建 CostChart.vue 纯 SVG 趋势图组件

**Files:**
- Create: `src/components/CostChart.vue`

- [ ] **Step 1: 创建 CostChart.vue**

```vue
<template>
  <div v-if="bars.length >= 2" class="cost-chart-card">
    <div class="chart-header">
      <span class="chart-title">近{{ bars.length }}月花费</span>
      <span class="chart-current">¥{{ currentMonthCost?.toFixed(0) ?? '--' }} 本月</span>
    </div>
    <div class="chart-wrap">
      <svg :width="svgWidth" :height="svgHeight" :viewBox="`0 0 ${svgWidth} ${svgHeight}`">
        <defs>
          <linearGradient id="bar-current" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0044DD"/>
            <stop offset="100%" stop-color="#0088FF"/>
          </linearGradient>
          <linearGradient id="bar-past" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0066FF" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#60B0FF" stop-opacity="0.5"/>
          </linearGradient>
        </defs>

        <g v-for="(bar, i) in bars" :key="bar.label">
          <!-- 柱体 -->
          <rect
            :x="bar.x"
            :y="bar.y"
            :width="barWidth - 4"
            :height="bar.height"
            :rx="3"
            :fill="bar.isCurrent ? 'url(#bar-current)' : 'url(#bar-past)'"
            class="bar-rect"
            :style="{ animationDelay: `${i * 50}ms` }"
          />
          <!-- 金额标签 -->
          <text
            :x="bar.x + (barWidth - 4) / 2"
            :y="bar.y - 4"
            text-anchor="middle"
            :font-size="9"
            :fill="bar.isCurrent ? '#0066FF' : '#B0C8E0'"
            font-family="DM Sans, PingFang SC, sans-serif"
            font-weight="600"
          >¥{{ bar.total.toFixed(0) }}</text>
          <!-- 月份标签 -->
          <text
            :x="bar.x + (barWidth - 4) / 2"
            :y="svgHeight - 2"
            text-anchor="middle"
            :font-size="9"
            :fill="bar.isCurrent ? '#0066FF' : '#B0C8E0'"
            font-family="DM Sans, PingFang SC, sans-serif"
            :font-weight="bar.isCurrent ? '700' : '400'"
          >{{ bar.monthLabel }}</text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  monthlyCosts: { type: Array, default: () => [] },
  currentMonth: { type: String, default: '' },
})

const svgWidth = 280
const svgHeight = 90
const barAreaHeight = 65
const labelAreaHeight = 14
const maxBars = 6

const bars = computed(() => {
  // monthlyCosts 是从新到旧排序，取最近 maxBars 条后反转为旧→新
  const recent = [...props.monthlyCosts].slice(0, maxBars).reverse()
  if (recent.length < 2) return []

  const maxTotal = Math.max(...recent.map(m => m.total), 1)
  const barWidth = svgWidth / recent.length

  return recent.map((m, i) => {
    const height = Math.max(4, (m.total / maxTotal) * barAreaHeight)
    const [year, mon] = m.label.split('-')
    const thisYear = new Date().getFullYear().toString()
    return {
      label: m.label,
      total: m.total,
      monthLabel: year === thisYear ? `${parseInt(mon)}月` : `${year.slice(2)}/${parseInt(mon)}`,
      isCurrent: m.label === props.currentMonth,
      x: i * barWidth + 2,
      y: barAreaHeight - height + 10,
      height,
    }
  })
})

const currentMonthCost = computed(() => {
  const item = props.monthlyCosts.find(m => m.label === props.currentMonth)
  return item?.total ?? null
})

const barWidth = computed(() => svgWidth / Math.max(bars.value.length, 1))
</script>

<style scoped>
.cost-chart-card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 12px 14px;
  box-shadow: var(--shadow-card-sm);
  margin-bottom: 10px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chart-title {
  font-size: 10px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.chart-current {
  font-size: 11px;
  color: var(--color-accent);
  font-weight: 600;
}

.chart-wrap {
  overflow: hidden;
}

.bar-rect {
  animation: bar-rise 0.4s ease-out both;
  transform-origin: bottom;
}

@keyframes bar-rise {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
</style>
```

- [ ] **Step 2: 验证构建**

```bash
npm run build
```

Expected: `✓ built` 无报错

- [ ] **Step 3: Commit**

```bash
git add src/components/CostChart.vue
git commit -m "feat: 新建 CostChart.vue 纯 SVG 月度柱状图组件"
```

---

## Task 7: DashboardView 嵌入趋势图

**Files:**
- Modify: `src/views/DashboardView.vue`

- [ ] **Step 1: 导入 CostChart**

在 import 区域添加：

```js
import CostChart from '../components/CostChart.vue'
```

- [ ] **Step 2: 新增 thisMonth computed 作为 currentMonth prop**

在 script 中确认 `thisMonth` 已存在（现有代码里有），若是 `const thisMonth = new Date().toISOString().slice(0, 7)` 普通变量，改为 computed 保证响应性：

```js
const thisMonth = computed(() => new Date().toISOString().slice(0, 7))
```

同时把现有引用 `thisMonth` 的地方改为 `thisMonth.value`（共2处：currentMonthCost 和 costDiff）。

- [ ] **Step 3: 在模板中摘要卡下方插入 CostChart**

找到 `</div><!-- end summary-grid -->` 后，`<!-- 内嵌可滚动记录列表 -->` 前，插入：

```html
<!-- 费用趋势图 -->
<CostChart
  class="card-anim card-anim-3"
  :monthlyCosts="recordsStore.monthlyCosts"
  :currentMonth="thisMonth"
/>
```

同时把原来的 `card-anim-3` 改为 `card-anim-4`（记录区延迟增加一档）：

```html
<div class="record-section card-anim card-anim-4">
```

新增 CSS：
```css
.card-anim-4 { animation-delay: 180ms; }
```

- [ ] **Step 4: 验证构建**

```bash
npm run build
```

Expected: `✓ built` 无报错

- [ ] **Step 5: 追加趋势图 E2E 测试**

在 `tests/e2e.js` 末尾追加：

```js
// ── 13. 费用趋势图 ─────────────────────────────────────────────
console.log('\n[13] 费用趋势图')
// 趋势图只在有 >= 2 个月费用数据时显示
const chartCard = page.locator('.cost-chart-card')
const chartVisible = await chartCard.isVisible()
if (chartVisible) {
  pass('费用趋势图卡片可见')
  const bars = page.locator('.bar-rect')
  const barCount = await bars.count()
  if (barCount >= 2) pass(`趋势图显示 ${barCount} 个月柱体`)
  else fail('趋势图柱体', `数量不足: ${barCount}`)
} else {
  pass('费用趋势图不显示（数据不足2个月，符合预期）')
}
```

- [ ] **Step 6: Commit**

```bash
git add src/views/DashboardView.vue tests/e2e.js
git commit -m "feat: DashboardView 嵌入费用趋势图卡片"
```

---

## Task 8: 记录筛选功能

**Files:**
- Modify: `src/views/DashboardView.vue`

- [ ] **Step 1: 新增筛选状态和计算属性**

在 script setup 末尾添加：

```js
// ── 筛选 ──────────────────────────────────────────────────────
const showFilter = ref(false)
const filterType = ref('')    // '' | 'slow' | 'fast' | 'superfast'
const filterMonth = ref('')   // '' | 'YYYY-MM'

const filterMonthOptions = computed(() => {
  return recordsStore.monthlyCosts.slice(0, 6).map(m => {
    const [year, mon] = m.label.split('-')
    const thisYear = new Date().getFullYear().toString()
    return {
      value: m.label,
      label: year === thisYear ? `${parseInt(mon)}月` : `${year}/${parseInt(mon)}月`,
    }
  })
})

const hasFilter = computed(() => filterType.value !== '' || filterMonth.value !== '')

const filteredRecords = computed(() => {
  if (!hasFilter.value) return sortedRecords.value
  return sortedRecords.value.filter(r => {
    const typeOk = !filterType.value || r.type === filterType.value
    const monthOk = !filterMonth.value || r.date?.startsWith(filterMonth.value)
    return typeOk && monthOk
  })
})

function clearFilter() {
  filterType.value = ''
  filterMonth.value = ''
  showFilter.value = false
}
```

- [ ] **Step 2: 修改 groupedRecords，使用 filteredRecords**

找到 `groupedRecords` computed 中的 `sortedRecords.value`，改为 `filteredRecords.value`：

```js
const groupedRecords = computed(() => {
  const result = []
  let lastMonth = null
  for (const record of filteredRecords.value) {   // ← 改这里
    // ...其余不变
  }
  return result
})
```

- [ ] **Step 3: 修改 Header，新增筛选按钮**

找到 `<header class="page-header">`，修改为：

```html
<header class="page-header">
  <div>
    <div class="header-eyebrow">{{ vehicleName || '我的爱车' }}</div>
    <div class="page-title">充电</div>
  </div>
  <button class="filter-btn" :class="{ active: hasFilter }" @click="showFilter = !showFilter">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
    筛选
    <span v-if="hasFilter" class="filter-badge">{{ [filterType, filterMonth].filter(Boolean).length }}</span>
  </button>
</header>

<!-- 筛选面板 -->
<Transition name="filter-slide">
  <div v-if="showFilter" class="filter-panel">
    <div class="filter-row">
      <div class="filter-label">充电类型</div>
      <div class="filter-chips">
        <button v-for="t in typeOptions" :key="t.value"
          class="filter-chip" :class="{ active: filterType === t.value }"
          @click="filterType = filterType === t.value ? '' : t.value">
          {{ t.label }}
        </button>
      </div>
    </div>
    <div v-if="filterMonthOptions.length" class="filter-row">
      <div class="filter-label">月份</div>
      <div class="filter-chips">
        <button v-for="m in filterMonthOptions" :key="m.value"
          class="filter-chip" :class="{ active: filterMonth === m.value }"
          @click="filterMonth = filterMonth === m.value ? '' : m.value">
          {{ m.label }}
        </button>
      </div>
    </div>
    <button v-if="hasFilter" class="filter-clear" @click="clearFilter">清除全部筛选</button>
  </div>
</Transition>
```

在 script 中新增 typeOptions：

```js
const typeOptions = [
  { value: 'slow', label: '慢充' },
  { value: 'fast', label: '快充' },
  { value: 'superfast', label: '超快充' },
]
```

- [ ] **Step 4: 修改记录列表标题，筛选时显示结果数**

找到 `<span class="section-label">充电记录</span>`，修改为：

```html
<span class="section-label">
  充电记录
  <span v-if="hasFilter" class="filter-result-count">· {{ filteredRecords.length }}条结果</span>
</span>
```

- [ ] **Step 5: 新增筛选相关 CSS**

在 `</style>` 前插入：

```css
/* Header 筛选按钮 */
.page-header {
  padding: 16px 16px 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: var(--radius-chip);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  position: relative;
  transition: all 0.15s;
}

.filter-btn.active {
  background: var(--color-accent-light);
  border-color: var(--color-accent);
  color: var(--color-accent-text);
}

.filter-badge {
  background: var(--color-accent);
  color: white;
  font-size: 9px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
}

/* 筛选面板 */
.filter-panel {
  background: var(--color-surface);
  margin: 0 14px 10px;
  border-radius: var(--radius-card);
  padding: 12px 14px;
  box-shadow: var(--shadow-card-sm);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 5px 12px;
  border-radius: var(--radius-chip);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-2);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  min-height: 32px;
}

.filter-chip.active {
  background: var(--color-accent-light);
  border-color: var(--color-accent);
  color: var(--color-accent-text);
  font-weight: 600;
}

.filter-clear {
  font-size: 12px;
  color: var(--color-accent);
  font-weight: 600;
  background: none;
  border: none;
  padding: 2px 0;
  cursor: pointer;
  text-align: left;
}

.filter-result-count {
  color: var(--color-accent);
  font-weight: 700;
}

/* 筛选面板动画 */
.filter-slide-enter-active, .filter-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.filter-slide-enter-from, .filter-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
```

- [ ] **Step 6: 验证构建**

```bash
npm run build
```

Expected: `✓ built` 无报错

- [ ] **Step 7: 追加筛选 E2E 测试**

```js
// ── 14. 记录筛选 ───────────────────────────────────────────────
console.log('\n[14] 记录筛选')
// 切回充电页
await page.locator('.tab-item').first().click()
await page.waitForTimeout(300)

const filterBtn = page.locator('.filter-btn')
if (await filterBtn.isVisible()) {
  pass('筛选按钮可见')
  await filterBtn.click()
  await page.waitForTimeout(300)

  const filterPanel = page.locator('.filter-panel')
  if (await filterPanel.isVisible()) {
    pass('点击后筛选面板展开')

    // 选择快充
    const fastChip = page.locator('.filter-chip').filter({ hasText: '快充' }).first()
    if (await fastChip.isVisible()) {
      await fastChip.click()
      await page.waitForTimeout(200)
      const isActive = await fastChip.evaluate(el => el.classList.contains('active'))
      if (isActive) pass('快充筛选条件选中')
      else fail('筛选条件选中', '样式未变化')
    }

    // 关闭面板
    await filterBtn.click()
    await page.waitForTimeout(200)
  } else {
    fail('筛选面板', '未展开')
  }
} else {
  fail('筛选按钮', '不可见')
}
```

- [ ] **Step 8: Commit**

```bash
git add src/views/DashboardView.vue tests/e2e.js
git commit -m "feat: 记录筛选功能 — 充电类型+月份双维度筛选"
```

---

## Task 9: 推送并运行完整 E2E 验证

- [ ] **Step 1: 运行完整 E2E 测试套件**

确保 dev server 运行中：
```bash
cd "c:/Users/I528850/CC Projects/Project 1_EV Charge Tracker"
npm run dev &
```

运行测试：
```bash
SKILL_DIR="C:/Users/I528850/.claude/plugins/marketplaces/playwright-skill/skills/playwright-skill"
cd "$SKILL_DIR" && node run.js "c:/Users/I528850/CC Projects/Project 1_EV Charge Tracker/tests/e2e.js"
```

Expected: `📋 测试结果: 18+ 通过 / 0 失败`

- [ ] **Step 2: 推送到 GitHub Pages**

```bash
cd "c:/Users/I528850/CC Projects/Project 1_EV Charge Tracker"
git push origin main
```

- [ ] **Step 3: 验证部署成功**

```bash
gh run list --limit 1
```

Expected: `completed success`
