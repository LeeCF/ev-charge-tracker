# EV 充电追踪 App UI 重设计方案

## 目标

将现有"仪表盘精密感"深色风格（AI 默认 Cluster 2）重设计为**活泼 × 精致融合**风格，提升视觉层次感、交互高级感和整体品质，同时保留所有现有功能。

## 设计方向

**气质参考：** Apple Health × Monzo × Duolingo 混血
- 白底浮卡结构保证轻盈克制
- 胶囊标签 / 圆角图标徽章注入活泼感
- 有品质感但不冰冷，有趣味但不幼稚

---

## 色彩系统

### 主色

| 名称 | 值 | 用途 |
|------|-----|------|
| 主色 Electric Blue | `#0066FF` | 按钮、强调、激活态 |
| 主色渐变高光 | `#00AAFF` | 进度条、渐变结束色 |
| 主色淡 | `#E0EDFF` | 胶囊标签背景、选中态背景 |
| 主色文字 | `#0055DD` | 淡背景上的主色文字 |

### 背景与表面

| 名称 | 值 | 用途 |
|------|-----|------|
| 页面背景 | `#F0F6FF` | App 全局背景（浅天蓝） |
| 卡片表面 | `#FFFFFF` | 所有浮卡背景 |
| 次级表面 | `#F5F9FF` | 输入框、选项组背景 |
| 边框 | `#D9ECFF` | 卡片边框、分割线 |

### 文字

| 名称 | 值 | 用途 |
|------|-----|------|
| 主文字 | `#061525` | 标题、数字、主要内容 |
| 次要文字 | `#7AAAD4` | 标签、提示、辅助信息 |
| 禁用文字 | `#B0C8E0` | 只读、禁用状态 |

### 功能色

| 名称 | 值 | 用途 |
|------|-----|------|
| 成功绿 | `#16A34A` | 满充标签、节省提示 |
| 成功绿淡 | `#EDFDF4` | 成功状态背景 |
| 危险红 | `#EF4444` | 删除按钮、危险操作 |
| 危险红淡 | `#FEF2F2` | 危险状态背景 |

### 阴影

```css
--shadow-card: 0 2px 14px rgba(0, 40, 120, 0.08);
--shadow-card-sm: 0 1px 6px rgba(0, 40, 120, 0.05);
--shadow-fab: 0 4px 20px rgba(0, 102, 255, 0.42);
--shadow-tab: 0 -1px 0 rgba(0, 40, 120, 0.06), 0 -4px 16px rgba(0, 40, 120, 0.04);
```

---

## 排版

| 角色 | 字体 | 规格 | 用途 |
|------|------|------|------|
| 显示数字 | Syne 800 | 48–56px，letter-spacing -2.5px | 倒计时天数、年度总费用 |
| 页面标题 | Syne 700 | 20–24px，letter-spacing -0.5px | 各页 header 标题 |
| 正文 | DM Sans 400/500/600 | 10–16px | 所有内容文字 |
| 中文回退 | PingFang SC | — | 所有中文内容 |

---

## 圆角规范

| 名称 | 值 | 用途 |
|------|-----|------|
| 卡片大 | `14px` | 主卡片（CountdownCard、LastRecordCard） |
| 卡片小 | `11px` | 次级卡片、统计行 |
| 按钮 | `11px` | 所有按钮 |
| 胶囊标签 | `20px` | 类型标签、状态徽章 |
| 图标容器 | `11–12px` | FAB、Tab 图标背景 |

---

## 交互动效规范

### A · 页面过渡

- **Tab 切换：** `slide-fade`，x 方向 ±16px + opacity 0→1，duration 220ms，ease-out
- **卡片进场：** staggered `translateY(12px) → 0` + `opacity 0 → 1`，duration 280ms，每张延迟 60ms，ease-out

### C · 数字翻牌

- **倒计时天数：** 数值变化时 CSS clip-path 翻入，从上往下滚动，duration 400ms，ease-in-out
- **费用数字：** 同上，用于年度/月度统计数字变化

实现方案：`@keyframes slot-in { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`

### D · 手势自然感

- **AddRecordSheet 弹出：** `cubic-bezier(0.32, 0.72, 0, 1)` spring 曲线，duration 380ms
- **AddRecordSheet 收起：** `cubic-bezier(0.4, 0, 1, 1)`，duration 260ms
- **列表滑删回弹：** 未达阈值时 `cubic-bezier(0.34, 1.56, 0.64, 1)` 弹回，duration 350ms
- **按钮点击：** `transform: scale(0.97)` active 态，duration 80ms

---

## 各组件改动详情

### `src/assets/main.css`

全面替换 CSS token：

```css
:root {
  --color-accent: #0066FF;
  --color-accent-light: #E0EDFF;
  --color-accent-text: #0055DD;
  --color-accent-gradient: linear-gradient(135deg, #0066FF 0%, #00AAFF 100%);
  --color-bg: #F0F6FF;
  --color-surface: #FFFFFF;
  --color-surface-2: #F5F9FF;
  --color-border: #D9ECFF;
  --color-border-strong: #A8CEFF;
  --color-text: #061525;
  --color-text-secondary: #7AAAD4;
  --color-text-muted: #B0C8E0;
  --color-danger: #EF4444;
  --color-danger-bg: #FEF2F2;
  --color-success: #16A34A;
  --color-success-bg: #EDFDF4;
  --radius-card: 14px;
  --radius-card-sm: 11px;
  --radius-btn: 11px;
  --radius-chip: 20px;
  --shadow-card: 0 2px 14px rgba(0, 40, 120, 0.08);
  --shadow-card-sm: 0 1px 6px rgba(0, 40, 120, 0.05);
  --shadow-fab: 0 4px 20px rgba(0, 102, 255, 0.42);
  --shadow-tab: 0 -1px 0 rgba(0, 40, 120, 0.06), 0 -4px 16px rgba(0, 40, 120, 0.04);
  --font-display: 'Syne', 'PingFang SC', sans-serif;
  --font-body: 'DM Sans', 'PingFang SC', 'Helvetica Neue', sans-serif;
}
```

### `src/components/CountdownCard.vue`

- 移除深色渐变英雄背景（`--gradient-hero`）
- 改为白卡（`--color-surface`）浮于页面背景上，使用 `--shadow-card`
- 刻度格（5×4 tick grid）替换为单条进度条（height 5px，渐变 `#0066FF → #00AAFF`）
- 天数数字加翻牌动画（`slot-in` keyframe）
- 布局：上方 eyebrow 标签 + 大数字 + 进度条，下方两个小统计格

### `src/views/DashboardView.vue`

- 卡片进场增加 stagger 动画（CSS animation-delay，每张 60ms）
- 页面背景透过 `--color-bg` 统一为浅天蓝
- header 徽章（电池类型）统一为胶囊样式

### `src/App.vue`（Tab 栏）

- 背景改为纯白 `#FFFFFF`，阴影改为 `--shadow-tab`
- Active 状态：图标变蓝 `--color-accent`，底部指示条 `width: 20px`，active 时 `transform: scale(1.05)` 弹跳
- 非 active 图标颜色 `--color-text-secondary`

### `src/components/FabButton.vue`

- 背景保持 `--color-accent-gradient`
- 阴影改为 `--shadow-fab`（蓝色调）
- 圆角 `--radius-btn`

### `src/components/AddRecordSheet.vue`

- 弹出/收起动画曲线更新为规范值
- 输入框 focus 态：`border-color: var(--color-accent)` + `box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.12)`
- 选中按钮（充电类型、位置 chip）统一为电气蓝胶囊样式
- Toggle 开关 on 态改用 `--color-accent-gradient`

### `src/components/RecordItem.vue`

- 滑删回弹动画曲线更新
- 胶囊标签统一：`tag--full` 用 `--color-accent-light` + `--color-accent-text`；`tag--type` 用 `--color-surface-2` + `--color-text-secondary`

### `src/components/LastRecordCard.vue`

- 天数数字（days-num）加翻牌动画
- 整体阴影改为 `--shadow-card`

### `src/views/HistoryView.vue`

- 年度卡片（yearly-card）背景保持深色（`--gradient-hero`），但文字和数字颜色跟随新 token
- Segmented control active 色改为 `--color-accent`
- 年度总金额颜色改为 `#00AAFF`（电气蓝高光）

### `src/views/SettingsView.vue`

- 选中的电池类型按钮：`border-color: --color-accent`，背景 `--color-accent-light`
- 整体阴影和边框跟随新 token

---

## 不改动的内容

- 所有功能逻辑（Pinia stores、表单验证、滑删删除、数据持久化）
- 路由结构和组件层级
- PWA manifest、service worker
- GitHub Actions 部署流程

---

## 成功标准

1. 视觉上：打开 App 第一感觉是"轻盈通透"，而非"沉重深色"
2. 交互上：Tab 切换、卡片进场、数字变化、弹窗出现均有流畅动效
3. 色彩上：电气蓝 `#0066FF` 作为唯一强调色贯穿全 App，配色关系协调
4. 功能上：所有现有功能完整保留，无回归问题
