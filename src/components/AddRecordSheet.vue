<template>
  <Teleport to="body">
    <div v-if="visible" class="sheet-overlay" @click.self="close">
      <div class="sheet">
        <div class="sheet-handle" />
        <h2 class="sheet-title">添加充电记录</h2>

        <!-- 充电日期 -->
        <div class="field">
          <label class="field-label">充电日期</label>
          <input type="date" class="field-input" v-model="form.date" />
        </div>

        <!-- 充电类型 -->
        <div class="field">
          <label class="field-label">充电类型</label>
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
          <label class="field-label">满充</label>
          <div class="toggle" :class="{ 'toggle--on': form.isFull }" @click="form.isFull = !form.isFull">
            <div class="toggle-thumb" />
          </div>
        </div>

        <!-- 结束电量（仅非满充时显示）-->
        <div class="field" v-if="!form.isFull">
          <label class="field-label">结束电量 <span class="field-hint">（选填，默认 80%）</span></label>
          <div class="soc-row">
            <input type="number" class="field-input field-input--sm" v-model.number="form.endSoc" min="1" max="99" />
            <span class="soc-unit">%</span>
          </div>
        </div>

        <!-- 充电地点 -->
        <div class="field">
          <label class="field-label">充电地点 <span class="field-hint">（选填）</span></label>
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

        <!-- 备注 -->
        <div class="field">
          <label class="field-label">备注 <span class="field-hint">（选填）</span></label>
          <input type="text" class="field-input" v-model="form.note" placeholder="如：充电桩故障中途停充" />
        </div>

        <button class="btn-submit" :disabled="!isValid" @click="submit">保存记录</button>
      </div>
    </div>
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
  background: rgba(0,0,0,0.4);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.sheet {
  background: var(--color-surface);
  border-radius: 20px 20px 0 0;
  padding: 12px 20px 40px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  margin: 0 auto 16px;
}

.sheet-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--color-text);
}

.field { margin-bottom: 16px; }

.field--row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 6px;
}

.field-hint {
  font-weight: 400;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.field-input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 15px;
  color: var(--color-text);
  background: var(--color-bg);
  outline: none;
}

.field-input:focus { border-color: var(--color-primary); }

.field-input--sm { width: 80px; }

.soc-row { display: flex; align-items: center; gap: 8px; }
.soc-unit { font-size: 15px; color: var(--color-text-secondary); }

.btn-group { display: flex; gap: 8px; }

.btn-option {
  flex: 1;
  padding: 10px 0;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-btn);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  transition: all 0.15s;
}

.btn-option--active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.toggle {
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background: var(--color-border);
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}

.toggle--on { background: var(--color-primary); }

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

.toggle--on .toggle-thumb { transform: translateX(20px); }

.location-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.chip {
  padding: 4px 12px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-size: 13px;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  transition: all 0.15s;
}

.chip--active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.btn-submit {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-btn);
  background: var(--color-primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
  transition: opacity 0.15s;
}

.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
