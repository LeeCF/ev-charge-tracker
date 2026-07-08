# EV 充电助手 · 功能扩展设计文档

## 目标

为已完成 UI 重设计的充电助手 App 新增 4 项核心功能：编辑记录、撤销删除、费用趋势图、记录筛选。

---

## 功能 1 · 编辑记录

### 入口
RecordItem 点击展开后，展开区域底部显示「编辑记录」胶囊按钮（UI 入口已实现，emit `edit` 事件尚未处理）。

### 交互方式
**复用 AddRecordSheet 预填数据**（方案 A）。点击编辑后打开现有底部弹窗，所有字段预填当前记录值，保存时更新而非新增。

### 数据层改动

**`src/stores/records.js`**
```js
function updateRecord(id, data) {
  const idx = records.value.findIndex(r => r.id === id)
  if (idx === -1) return
  records.value[idx] = {
    ...records.value[idx],
    type: data.type,
    isFull: data.isFull,
    endSoc: data.isFull ? 100 : (data.endSoc ?? 80),
    cost: data.cost != null && data.cost !== '' ? Number(data.cost) : null,
    location: data.location ?? '',
    note: data.note ?? '',
  }
  saveRecords(records.value)
}
// 导出 updateRecord
```

**`src/components/AddRecordSheet.vue`**
- 新增 prop：`editRecord: Object | null`（默认 null）
- 有 `editRecord` 时：标题改为「编辑充电记录」，表单字段预填，保存调用 `updateRecord` 而非 `addRecord`
- emit `saved` 携带 `{ id, mode: 'add' | 'edit' }`

**`src/App.vue`**
- 新增 `editingRecord: ref(null)`
- FAB 的 `showSheet` 触发时 `editingRecord = null`（新增模式）
- 监听 RecordItem 的 `edit` 事件，设置 `editingRecord = record`，`showSheet = true`

### 注意
- 日期字段在编辑模式下可修改（用户可能记录日期填错）
- 编辑后记录在列表中位置不变（不重排）

---

## 功能 2 · 撤销删除

### 交互方式
**原地变色提示卡**（方案 C）。滑删后记录原地变为深蓝色提示卡，显示删除信息和「撤销」按钮，底部 3 秒倒计时进度条，到期后真正执行删除。

### 软删除逻辑

**`src/stores/records.js`**
```js
// 新增：标记待删除（软删除）
function markPendingDelete(id) {
  const record = records.value.find(r => r.id === id)
  if (record) record.pendingDelete = true
}

// 新增：恢复删除（撤销）
function restoreRecord(id) {
  const record = records.value.find(r => r.id === id)
  if (record) delete record.pendingDelete
}

// deleteRecord 保持不变（真正删除）
```

**`src/components/RecordItem.vue`**
- 接收 `record.pendingDelete` 状态
- `pendingDelete === true` 时：卡片变为深蓝提示卡样式，显示「已删除 · [日期·类型]」+ 「撤销」按钮 + 底部进度条
- 滑删触发 `triggerDelete()` 时：改为 emit `pending-delete`，不再直接 emit `delete`

**`src/views/DashboardView.vue`**
```js
function onPendingDelete(id) {
  recordsStore.markPendingDelete(id)
  const timer = setTimeout(() => {
    recordsStore.deleteRecord(id)
  }, 3000)
  pendingTimers.value[id] = timer
}

function onUndoDelete(id) {
  clearTimeout(pendingTimers.value[id])
  delete pendingTimers.value[id]
  recordsStore.restoreRecord(id)
}
```

### 视觉规格
- 提示卡背景：`linear-gradient(145deg, #0A1E3D, #0D2D5A)`
- 文字：`rgba(255,255,255,0.75)`，「撤销」按钮：`#60B4FF` 粗体
- 进度条：高 2px，颜色 `#0066FF`，3 秒从 100% 消耗到 0
- E2E 测试新增：验证撤销后记录恢复

---

## 功能 3 · 费用趋势图

### 位置
充电页，摘要卡（上次充电 + 本月花费）下方，记录区域上方，作为独立白色卡片。

### 显示条件
`recordsStore.monthlyCosts.length >= 2` 才显示，否则卡片完全不渲染（不占空间）。

### 图表规格
- 纯 SVG，无外部库
- 显示最近 6 个月（或有数据的月份，最多 6 个）
- 当月柱体：`linear-gradient(to top, #0044DD, #0088FF)`，阴影 `0 2px 6px rgba(0,102,255,0.4)`
- 其他月份：`linear-gradient(to top, #0066FF, #60B0FF)`，opacity 递减（越老越浅）
- 柱体上方显示金额（¥XX），下方显示月份标签（7月）
- 卡片标题：「近N月花费」，右侧显示本月金额
- 进场动画：柱体从底部 scaleY(0) → scaleY(1)，stagger 50ms

### 数据来源
直接使用 `recordsStore.monthlyCosts`（已有），取最后 6 条并反转为时间正序。

---

## 功能 4 · 记录筛选

### 触发
**顶部筛选栏，展开式**（方案 A）。充电页标题行右侧「筛选」按钮（漏斗 SVG 图标），有激活条件时按钮变蓝并显示条件数徽章。

### 筛选条件
- **充电类型**：全部 / 慢充 / 快充 / 超快充（单选）
- **月份**：全部 / 最近 6 个月（根据 monthlyCosts 自动生成，单选）
- 两个维度 AND 关系同时生效

### 筛选面板 UI
- 点击按钮后在标题下方 slide-down 展开白色面板
- 两行 chip 选择器（类型一行 + 月份一行）
- 「清除全部」链接
- 点击面板外区域或再次点击按钮收起

### 筛选状态反馈
- 按钮激活态：蓝色背景，徽章显示条件数（如 `2`）
- 列表标题显示：「充电记录 · 2条结果」
- 当前条件以标签形式显示（「快充 ×」「7月 ×」），可点 × 单独清除

### 数据层
```js
// DashboardView.vue 新增
const filterType = ref('')    // '' | 'slow' | 'fast' | 'superfast'
const filterMonth = ref('')   // '' | 'YYYY-MM'

const filteredRecords = computed(() => {
  return sortedRecords.value.filter(r => {
    const typeOk = !filterType.value || r.type === filterType.value
    const monthOk = !filterMonth.value || r.date?.startsWith(filterMonth.value)
    return typeOk && monthOk
  })
})
// groupedRecords 改用 filteredRecords 而非 sortedRecords
```

---

## 实现顺序建议

1. **撤销删除**（独立，改动集中在 RecordItem + DashboardView）
2. **编辑记录**（依赖 AddRecordSheet 改造，相对复杂）
3. **费用趋势图**（纯新增卡片，不影响现有逻辑）
4. **记录筛选**（最复杂，依赖前几项稳定后实现）

---

## 不改动的内容

- Pinia store 的其他 computed（sortedRecords、progressPercent 等）
- 路由结构
- PWA manifest、GitHub Actions
- E2E 测试文件（每个功能完成后追加对应测试用例）
