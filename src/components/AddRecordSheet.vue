<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="visible" class="sheet-overlay" @click.self="close">
        <Transition name="sheet-slide">
          <div v-if="visible" class="sheet">
            <div class="sheet-handle" />
            <h2 class="sheet-title">添加充电记录</h2>

            <!-- 充电日期 -->
            <div class="field">
              <label class="field-label">
                <svg class="field-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                  <rect x="2" y="3" width="12" height="12" rx="1.5"/>
                  <line x1="11" y1="1" x2="11" y2="5"/>
                  <line x1="5" y1="1" x2="5" y2="5"/>
                  <line x1="2" y1="7" x2="14" y2="7"/>
                </svg>
                充电日期
              </label>
              <input type="date" class="field-input" v-model="form.date" />
            </div>

            <!-- 充电类型 -->
            <div class="field">
              <label class="field-label">
                <svg class="field-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 2L5 9h5l-3 5 6-8H8l1-4z"/>
                </svg>
                充电类型
              </label>
              <div class="btn-group">
                <button
                  v-for="t in chargeTypes"
                  :key="t.value"
                  class="btn-option"
                  :class="{ 'btn-option--active': form.type === t.value }"
                  @click="form.type = t.value"
                >{{ t.label }}</button>
              </div>
            </div>

            <!-- 是否满充 -->
            <div class="field field--row">
              <label class="field-label field-label--inline">
                <svg class="field-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                  <rect x="2" y="5" width="12" height="8" rx="1.5"/>
                  <path d="M14 8h1.5a.5.5 0 0 1 0 2H14"/>
                  <rect x="4" y="7" width="7" height="4" rx="1" fill="currentColor" stroke="none" class="battery-fill" />
                </svg>
                满充
              </label>
              <div class="toggle" :class="{ 'toggle--on': form.isFull }" @click="form.isFull = !form.isFull">
                <div class="toggle-thumb" />
              </div>
            </div>

            <!-- 结束电量 -->
            <Transition name="field-fade">
              <div class="field" v-if="!form.isFull">
                <label class="field-label">结束电量 <span class="field-hint">（选填，默认 80%）</span></label>
                <div class="soc-row">
                  <input type="number" class="field-input field-input--sm" v-model.number="form.endSoc" min="1" max="99" />
                  <span class="soc-unit">%</span>
                  <div class="soc-bar-wrap">
                    <div class="soc-bar" :style="{ width: (form.endSoc || 0) + '%' }" />
                  </div>
                </div>
              </div>
            </Transition>

            <!-- 充电地点 -->
            <div class="field">
              <label class="field-label">
                <svg class="field-icon" viewBox="0 0 12 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                  <path d="M6 1C3.24 1 1 3.24 1 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z"/>
                  <circle cx="6" cy="6" r="1.5"/>
                </svg>
                充电地点 <span class="field-hint">（选填）</span>
              </label>
              <input type="text" class="field-input" v-model="form.location" placeholder="如：家、公司、商场" />
              <div v-if="recentLocations.length" class="location-chips">
                <button
                  v-for="loc in recentLocations"
                  :key="loc"
                  class="chip"
                  :class="{ 'chip--active': form.location === loc }"
                  @click="form.location = form.location === loc ? '' : loc"
                >{{ loc }}</button>
              </div>
            </div>

            <!-- 充电电费 -->
            <div class="field">
              <label class="field-label">
                <svg class="field-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="8" cy="8" r="6.5"/>
                  <path d="M8 4.5v7M5.5 6.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2c0 2-5 2-5 4 0 1.1.9 2 2.5 2s2.5-.9 2.5-2"/>
                </svg>
                充电电费 <span class="field-hint">（选填，元）</span>
              </label>
              <div class="cost-row">
                <input type="number" class="field-input field-input--sm" v-model.number="form.cost" min="0" step="0.01" placeholder="0.00" />
                <span class="cost-unit">元</span>
              </div>
            </div>

            <!-- 备注 -->
            <div class="field">
              <label class="field-label">
                <svg class="field-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                  <rect x="2" y="2" width="12" height="12" rx="2"/>
                  <line x1="5" y1="6" x2="11" y2="6"/>
                  <line x1="5" y1="9" x2="9" y2="9"/>
                </svg>
                备注 <span class="field-hint">（选填）</span>
              </label>
              <input type="text" class="field-input" v-model="form.note" placeholder="如：充电桩故障中途停充" />
            </div>

            <button class="btn-submit" :disabled="!isValid" @click="submit">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 10H4M10 4l6 6-6 6"/>
              </svg>
              保存记录
            </button>
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
  { value: 'slow', label: '慢充' },
  { value: 'fast', label: '快充' },
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
  resetForm()
}

function resetForm() {
  form.date = todayStr()
  form.type = ''
  form.isFull = false
  form.endSoc = 80
  form.cost = null
  form.location = ''
  form.note = ''
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
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.sheet {
  background: var(--color-surface);
  border-radius: 24px 24px 0 0;
  padding: 12px 20px 48px;
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  margin: 0 auto 18px;
}

.sheet-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--color-text);
  letter-spacing: -0.3px;
}

.field { margin-bottom: 18px; }

.field--row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.field-label--inline {
  margin-bottom: 0;
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

.field-hint {
  font-weight: 400;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.field-input {
  width: 100%;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 15px;
  color: var(--color-text);
  background: var(--color-bg);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.field-input:focus {
  border-color: var(--color-border-strong);
  box-shadow: none;
}

.field-input--sm { width: 100px; }

.soc-row { display: flex; align-items: center; gap: 10px; }
.soc-unit { font-size: 15px; color: var(--color-text-secondary); }

.soc-bar-wrap {
  flex: 1;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}
.soc-bar {
  height: 100%;
  background: var(--gradient-accent);
  border-radius: 2px;
  transition: width 0.3s;
  max-width: 100%;
}

.cost-row { display: flex; align-items: center; gap: 10px; }
.cost-unit { font-size: 15px; color: var(--color-text-secondary); }

.btn-group { display: flex; gap: 8px; }

.btn-option {
  flex: 1;
  padding: 11px 0;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-btn);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  transition: all 0.15s;
}

/* Selected type: strong border + dark text, no green */
.btn-option--active {
  border-color: var(--color-text);
  color: var(--color-text);
  background: var(--color-surface-2);
  font-weight: 600;
}

.toggle {
  width: 50px;
  height: 30px;
  border-radius: 15px;
  background: var(--color-border);
  cursor: pointer;
  position: relative;
  transition: background 0.25s;
  flex-shrink: 0;
}

/* Toggle on: green IS correct here — it's binary state feedback */
.toggle--on { background: var(--gradient-accent); }

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 6px rgba(0,0,0,0.2);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle--on .toggle-thumb { transform: translateX(20px); }

.location-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.chip {
  padding: 5px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  font-size: 13px;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  transition: all 0.15s;
}

/* Location chip active: neutral dark, no green */
.chip--active {
  border-color: var(--color-border-strong);
  color: var(--color-text);
  background: var(--color-surface-2);
  font-weight: 600;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 15px;
  border-radius: var(--radius-btn);
  background: var(--gradient-accent);   /* Green CTA — correct, this is the action */
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
  box-shadow: var(--shadow-fab);
  transition: opacity 0.15s, transform 0.15s;
  letter-spacing: 0.3px;
}

.btn-submit svg {
  width: 18px;
  height: 18px;
}

.btn-submit:not(:disabled):active {
  transform: scale(0.98);
}

.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

/* Transitions */
.overlay-fade-enter-active, .overlay-fade-leave-active {
  transition: opacity 0.25s;
}
.overlay-fade-enter-from, .overlay-fade-leave-to {
  opacity: 0;
}

.sheet-slide-enter-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.sheet-slide-enter-from, .sheet-slide-leave-to {
  transform: translateY(100%);
}

.field-fade-enter-active, .field-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.field-fade-enter-from, .field-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
