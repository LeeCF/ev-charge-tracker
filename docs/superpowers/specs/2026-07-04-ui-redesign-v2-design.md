# EV 充电追踪 App · UI 全面重设计方案

> 本文档取代 `2026-07-03-ui-redesign-design.md`，为完整最终版本。

## 设计目标

将现有"仪表盘精密感"深色风格（AI 默认 Cluster 2）全面重设计为**活泼 × 精致融合**风格，同时依据移动端最佳实践重构信息架构，提升视觉层次感、交互高级感和整体品质，保留所有现有功能逻辑。

---

## 一、信息架构

### 导航结构：2 Tab

依据 NNGroup + Apple WWDC 2022 研究结论（97 agent 验证）：
- Tab 最多 3–4 个，越少越好
- 同一主题域子功能应层级嵌套，不应并列为独立 Tab
- 避免"Home 万能 Tab"（Apple 明确警告）

| Tab | 图标 | 包含内容 |
|-----|------|---------|
| ⚡ 充电 | 闪电 | 状态卡片 + 摘要卡 + 固定高度内嵌滚动记录列表 |
| ⚙️ 设置 | 齿轮 | 电池类型可视化选择 + 满充间隔滑块 + 车型名称 + 数据管理 |

**移除"历史"Tab**：充电记录内嵌于充电页，费用统计暂不作为独立 Tab（可后续扩展）。

### 添加记录入口：扩展 FAB

- 静止时：扩展胶囊「⚡ 记录充电」（高 56dp，圆角 28dp）
- 向下滚动时：自动收缩为圆角方形「+」（56×56dp，圆角 16dp）
- 位置：距屏幕右边 16dp，悬浮于 Tab 栏上方 16dp
- 不覆盖任何内容，滚动区 padding-bottom = 120dp

---

## 二、色彩系统

### 主色

| Token | 值 | 用途 |
|-------|----|------|
| `--color-accent` | `#0066FF` | 按钮、强调、激活态、进度条起始 |
| `--color-accent-end` | `#00AAFF` | 进度条渐变结束色、扩展 FAB 渐变 |
| `--color-accent-light` | `#E0EDFF` | 胶囊标签背景、选中态背景 |
| `--color-accent-text` | `#0055DD` | 淡背景上的主色文字 |
| `--color-accent-gradient` | `linear-gradient(135deg, #0055E0, #0088FF)` | FAB、保存按钮、英雄卡进度环 |

### 英雄卡

| Token | 值 | 用途 |
|-------|----|------|
| `--color-hero` | `linear-gradient(145deg, #0A1E3D, #0D2D5A, #0A3070)` | CountdownCard 背景 |
| `--color-hero-glow` | `radial-gradient(circle, rgba(0,102,255,0.25), transparent 65%)` | 英雄卡右上角光晕 |

### 背景与表面

| Token | 值 | 用途 |
|-------|----|------|
| `--color-bg` | `#F0F6FF` | 页面全局背景（浅天蓝） |
| `--color-surface` | `#FFFFFF` | 所有白色浮卡背景 |
| `--color-surface-2` | `#F5F9FF` | 输入框、选项背景 |
| `--color-border` | `#D9ECFF` | 卡片边框、分割线 |
| `--color-border-strong` | `#A8CEFF` | 输入框 focus 边框 |

### 文字

| Token | 值 | 用途 |
|-------|----|------|
| `--color-text` | `#061525` | 主文字 |
| `--color-text-secondary` | `#7AAAD4` | 次要文字、标签 |
| `--color-text-muted` | `#B0C8E0` | 禁用、提示 |

### 功能色

| Token | 值 | 用途 |
|-------|----|------|
| `--color-success` | `#16A34A` | 满充标签、省钱提示 |
| `--color-success-bg` | `#EDFDF4` | 成功状态背景 |
| `--color-danger` | `#EF4444` | 删除、危险操作 |
| `--color-danger-bg` | `#FEF2F2` | 危险状态背景 |

### 阴影

```css
--shadow-card: 0 2px 14px rgba(0, 40, 120, 0.08);
--shadow-card-sm: 0 1px 6px rgba(0, 40, 120, 0.05);
--shadow-fab: 0 4px 20px rgba(0, 102, 255, 0.42);
--shadow-tab: 0 -1px 0 rgba(0, 40, 120, 0.06), 0 -4px 16px rgba(0, 40, 120, 0.04);
```

---

## 三、排版规范

| 角色 | 字体 | 规格 |
|------|------|------|
| 显示大数字 | Syne 800 | 48–64px，letter-spacing -3px |
| 次级数字 | Syne 800 | 20–22px，letter-spacing -0.5px |
| 页面标题 | Syne 700 | 22–26px，letter-spacing -0.5px |
| 正文 | DM Sans 400/500/600 | 13–15px |
| 辅助文字 | DM Sans 400 | 10–12px |
| 中文回退 | PingFang SC | 所有中文内容 |

---

## 四、移动端尺寸规范

### 触控目标

| 元素 | 最小尺寸 | 备注 |
|------|---------|------|
| 主按钮 | 50–54px 高 | 保存按钮、充电类型按钮 |
| FAB | 56×56dp | Material Design 3 标准 |
| 列表行 | ≥44px 高 | padding top+bottom+内容总和 |
| 胶囊 chip | 32–36px 高 | 地点选择、标签 |
| Tab 图标区 | 44×44pt | 含点击热区 |

### 间距

| 场景 | 值 |
|------|-----|
| 页面水平边距 | 14–16px |
| 主卡片内边距 | 16px 水平，14px 垂直 |
| 次级卡片内边距 | 12px 水平，10px 垂直 |
| 卡片间距 | 8–10px |
| 表单字段间距 | 14px |

### 圆角

| 元素 | 值 |
|------|-----|
| 英雄卡（CountdownCard） | 18–20px |
| 主卡片 | 14–16px |
| 次级卡片 | 10–12px |
| 输入框 | 10px |
| 按钮 | 10–12px |
| 胶囊标签 | 20px（全圆） |
| FAB 扩展态 | 28px（胶囊） |
| FAB 收缩态 | 16px（圆角方形） |
| 底部弹窗顶部 | 20–24px |

### 安全区

```css
/* Tab 栏底部安全区 */
padding-bottom: calc(env(safe-area-inset-bottom, 0px));

/* 滚动内容底部留空（FAB + Tab + 安全区） */
padding-bottom: calc(120px + env(safe-area-inset-bottom, 0px));

/* 页面顶部状态栏 */
padding-top: env(safe-area-inset-top, 0px);
```

---

## 五、交互动效规范

### 页面过渡

```css
/* Tab 切换 slide-fade */
.tab-enter-active { transition: opacity 0.22s ease-out, transform 0.22s ease-out; }
.tab-enter-from { opacity: 0; transform: translateX(16px); }

/* 卡片进场 stagger */
.card-1 { animation-delay: 0ms; }
.card-2 { animation-delay: 60ms; }
.card-3 { animation-delay: 120ms; }
@keyframes card-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 数字翻牌

```css
@keyframes slot-in {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
.number-flip { animation: slot-in 0.4s ease-in-out; overflow: hidden; }
```

适用于：CountdownCard 天数、LastRecordCard 天数、HistoryView 年度总金额。

### 扩展 FAB 收缩

```css
/* 静止 → 展开（扩展胶囊） */
.fab { width: auto; padding: 0 20px; border-radius: 28px; gap: 8px; }
.fab-label { opacity: 1; width: auto; transition: opacity 0.2s, width 0.3s cubic-bezier(0.4,0,0.2,1); }

/* 滚动中 → 收缩（圆角方形） */
.fab.collapsed { width: 56px; padding: 0; border-radius: 16px; }
.fab.collapsed .fab-label { opacity: 0; width: 0; overflow: hidden; }
```

### 底部弹窗

```css
/* 弹出 */
.sheet-enter-active { transition: transform 0.38s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-enter-from   { transform: translateY(100%); }

/* 收起 */
.sheet-leave-active { transition: transform 0.26s cubic-bezier(0.4, 0, 1, 1); }
.sheet-leave-to     { transform: translateY(100%); }
```

### 滑删回弹

```css
/* 未达阈值弹回 */
.record-snapback { transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }

/* 按钮点击缩放 */
button:active { transform: scale(0.97); transition: transform 0.08s ease; }
```

---

## 六、各页面/组件改动详情

### `src/assets/main.css`

完整替换所有 CSS token（见第二节色彩系统），新增：

```css
--radius-hero: 18px;
--radius-card: 14px;
--radius-card-sm: 11px;
--radius-btn: 11px;
--radius-chip: 20px;
--radius-fab: 16px;
--radius-fab-extended: 28px;
```

### `src/App.vue`

- 简化为 2 Tab：⚡ 充电 / ⚙️ 设置
- 移除 HistoryView 路由入口（内容迁移至 DashboardView）
- Tab 栏：白底 `#FFFFFF`，阴影 `--shadow-tab`
- Active 状态：图标蓝色 + 底部 20px 指示条 + scale(1.05) 弹跳
- Tab 栏高度：49px + `safe-area-inset-bottom`

### `src/components/CountdownCard.vue`

- **背景**：移除深色渐变 → 改为 `--color-hero` 深海蓝渐变
- **右上角光晕**：`position: absolute` 的径向渐变装饰层
- **布局**：eyebrow 标签 + 大数字（左）+ 圆形 SVG 进度环（右）
- **进度条**：移除刻度格（tick grid）→ 圆形 SVG 进度环（stroke-dasharray/offset）
- **数字翻牌**：天数变化时触发 `slot-in` 动画
- **胶囊标签**：电池类型 + 周期天数，`--color-accent-light` 背景

### `src/views/DashboardView.vue`

- **卡片进场**：stagger animation（每张 60ms 延迟）
- **2列摘要卡**：上次充电（天数 + 类型 chip）/ 本月花费（金额 + 同比）
- **内嵌滚动记录区**：
  - 固定高度 `max-height: 3 * 行高`（约 160px）
  - 内部 `overflow-y: auto`，`-webkit-overflow-scrolling: touch`
  - 顶部标题行 + 底部"查看全部 →"链接
  - 底部渐变遮罩提示可滚动
- 移除独立 LastRecordCard（信息整合到摘要卡）

### `src/components/FabButton.vue`（扩展 FAB 重写）

```html
<button class="fab" :class="{ collapsed: isScrolled }">
  <svg><!-- + 图标 --></svg>
  <span class="fab-label">记录充电</span>
</button>
```

- 监听页面滚动：`scrollY > 60` 时 `isScrolled = true`，收缩为圆角方形
- 位置：`position: fixed; right: 16px; bottom: calc(49px + 16px + env(safe-area-inset-bottom))`
- 阴影：`--shadow-fab`

### `src/components/AddRecordSheet.vue`（一屏智能表单重写）

布局改为行内紧凑风格：

```
日期行：左对齐标签 ←→ 右对齐当前日期（可点击）
充电类型：3个等宽 chip 按钮
满充行：左标签 ←→ 右 toggle 开关
地点行：左标签 ←→ 右历史 chip 快选 + 自定义输入
费用行：左标签 ←→ 右金额内联输入框
```

- 字段间距 14px，分割线 `1px solid #F0F6FF`
- 输入框 focus：`border-color: --color-accent` + `box-shadow: 0 0 0 3px rgba(0,102,255,0.12)`
- 保存按钮：全宽，`--color-accent-gradient`，高度 52px，圆角 12px
- 弹窗高度：`max-height: 90vh`，内部 `overflow-y: auto`

### `src/views/SettingsView.vue`（可视化设计重写）

```
满充间隔：
  左"满充间隔" ←→ 右大数字（蓝色，22px Syne）
  进度条滑块（height 6px，thumb 18×18px）
  7天 ←→ 90天 标注

电池类型：
  3格等宽卡片（磷酸铁锂 / 三元锂 / 自定义）
  选中态：蓝色渐变背景 + 白字 + "已选 ✓"徽章
  未选态：白底 + 蓝色边框

车型名称：
  单行输入框，F0F6FF 背景

数据管理：
  危险按钮：FEF2F2 背景 + EF4444 边框 + 红色文字
```

### `src/components/RecordItem.vue`

- 行高：`padding: 10px 12px`，确保总高度 ≥ 44px
- 胶囊标签：`tag--full` → `--color-accent-light` + `--color-accent-text`；`tag--type` → `--color-surface-2` + `--color-text-secondary`
- 滑删回弹：更新为 `cubic-bezier(0.34, 1.56, 0.64, 1)`
- 删除背景：`--color-danger`

---

## 七、移除的页面/组件

| 移除项 | 原因 | 内容去向 |
|--------|------|---------|
| `src/views/HistoryView.vue` | 2 Tab 架构下无独立历史 Tab | 记录列表内嵌 DashboardView，费用统计暂移除（后续可加） |
| `src/components/LastRecordCard.vue` | 信息整合 | 上次充电摘要移入 DashboardView 摘要卡 |

---

## 八、不改动的内容

- 所有功能逻辑（Pinia stores、表单验证、滑删删除、数据持久化）
- PWA manifest、service worker、GitHub Actions 部署流程
- `index.html` Google Fonts（Syne + DM Sans 已引入）

---

## 九、成功标准

1. **视觉**：打开 App 第一感觉是"轻盈通透"，深海蓝英雄卡有沉浸感但不压抑
2. **交互**：FAB 静止展开、滚动收缩；弹窗 spring 弹入；数字翻牌；卡片 stagger 进场
3. **效率**：最快添加记录路径：点 FAB → 选类型 → 保存，约 5 秒
4. **规范**：所有触控目标 ≥ 44px，安全区适配，圆角/间距符合移动端标准
5. **一致性**：电气蓝 `#0066FF` 作为唯一强调色贯穿全 App
