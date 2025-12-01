<script setup>
const props = defineProps({
  label: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  min: { type: [Number, String], default: undefined },
  step: { type: [Number, String], default: undefined },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <label class="field">
    <span v-if="label" class="label">{{ label }}</span>
    <input
        class="input"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :min="min"
        :step="step"
        :disabled="disabled"
        @input="onInput"
    />
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.label {
  color: #4b5563;
  font-weight: 500;
}
.input {
  border-radius: 0.5rem;
  border: 1px solid #d0d0d0;
  padding: 0.45rem 0.6rem;
  background: #ffffff;          /* campo blanco */
  color: #333333;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* leve sombra como la tarjeta del wireframe */
}

.input:focus {
  outline: none;
  border-color: #00c853;        /* verde al enfocarse */
}

.input:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

</style>
