<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="visible" class="sheet-overlay" @click.self="close">
        <Transition name="sheet-slide">
          <div v-if="visible" class="sheet">
            <!-- 拖拽条 -->
            <div class="sheet-handle" />

            <!-- 标题 -->
            <div class="sheet-title">{{ props.editRecord ? '编辑充电记录' : '添加充电记录' }}</div>

            <!-- 表单 -->
            <div class="sheet-body">

              <!-- 日期行 -->
              <div class="form-row">
                <span class="form-label">
                  <svg class="field-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                    <rect x="2" y="3" width="12" height="11" rx="1.5"/>
                    <line x1="10" y1="1.5" x2="10" y2="4.5"/>
                    <line x1="6" y1="1.5" x2="6" y2="4.5"/>
                    <line x1="2" y1="7" x2="14" y2="7"/>
                  </svg>
                  日期
                </span>
                <input type="date" class="form-date" v-model="form.date" />
              </div>

              <!-- 充电类型 -->
              <div class="form-row form-row--col">
                <span class="form-label">
                  <svg class="field-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 2L5 9h5l-3 5 6-8H8l1-4z"/>
                  </svg>
                  充电类型
                </span>
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
                <span class="form-label">
                  <svg class="field-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                    <rect x="1" y="5" width="12" height="7" rx="1.5"/>
                    <path d="M13 8h1.5a.5.5 0 0 1 0 2H13"/>
                    <rect x="3" y="7" width="7" height="3" rx="0.8" fill="currentColor" stroke="none" class="battery-fill"/>
                  </svg>
                  满充
                </span>
                <div class="toggle" :class="{ on: form.isFull }" @click="form.isFull = !form.isFull">
                  <div class="toggle-thumb" />
                </div>
              </div>

              <!-- 结束电量（非满充时显示） -->
              <Transition name="field-fade">
                <div v-if="!form.isFull" class="form-row">
                  <span class="form-label">
                    <svg class="field-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                      <rect x="1" y="5" width="12" height="7" rx="1.5"/>
                      <path d="M13 8h1.5a.5.5 0 0 1 0 2H13"/>
                      <rect x="3" y="7" width="4" height="3" rx="0.8" fill="currentColor" stroke="none" class="battery-fill"/>
                    </svg>
                    电量 <span class="form-hint">选填</span>
                  </span>
                  <div class="soc-row">
                    <input type="number" class="form-input-sm" v-model.number="form.endSoc" min="1" max="99" />
                    <span class="form-unit">%</span>
                  </div>
                </div>
              </Transition>

              <!-- 地点 -->
              <div class="form-row form-row--col">
                <span class="form-label">
                  <svg class="field-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                    <path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z"/>
                    <circle cx="8" cy="6" r="1.5"/>
                  </svg>
                  地点 <span class="form-hint">选填</span>
                </span>
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
                <span class="form-label">
                  <svg class="field-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="8" cy="8" r="6.5"/>
                    <path d="M8 4.5v7M5.5 6.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2c0 2-5 2-5 4 0 1.1.9 2 2.5 2s2.5-.9 2.5-2"/>
                  </svg>
                  电费 <span class="form-hint">选填</span>
                </span>
                <div class="cost-row">
                  <span class="form-unit">¥</span>
                  <input type="number" class="form-input-sm" v-model.number="form.cost" min="0" step="0.01" placeholder="0.00" />
                </div>
              </div>

              <!-- 备注行 -->
              <div class="form-row form-row--col">
                <span class="form-label">
                  <svg class="field-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                    <rect x="2" y="2" width="12" height="12" rx="2"/>
                    <line x1="5" y1="6" x2="11" y2="6"/>
                    <line x1="5" y1="9" x2="9" y2="9"/>
                  </svg>
                  备注 <span class="form-hint">选填</span>
                </span>
                <input type="text" class="form-input" v-model="form.note" placeholder="如：充电桩故障中途停充" />
              </div>

            </div>

            <!-- 保存按钮 -->
            <div class="sheet-footer">
              <button class="btn-save" :disabled="!isValid" @click="submit">
                {{ props.editRecord ? '保存修改' : '保存记录' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRecordsStore } from '../stores/records.js'

const props = defineProps({
  visible: Boolean,
  editRecord: { type: Object, default: null },
})
const emit = defineEmits(['update:visible', 'saved'])

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
  if (props.editRecord) {
    recordsStore.updateRecord(props.editRecord.id, { ...form })
    emit('saved', { id: props.editRecord.id, mode: 'edit' })
  } else {
    const newId = recordsStore.addRecord({ ...form })
    emit('saved', { id: newId, mode: 'add' })
  }
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
  display: flex;
  align-items: center;
  gap: 6px;
}

.field-icon {
  width: 14px;
  height: 14px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.battery-fill {
  color: var(--color-text-secondary);
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
