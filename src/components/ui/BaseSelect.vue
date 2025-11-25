<script setup>
const props = defineProps({
  label: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' }
})

const emit = defineEmits(['update:modelValue'])

function onChange(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <label class="field">
    <span v-if="label" class="label">{{ label }}</span>
    <select class="select" :value="modelValue" @change="onChange">
      <slot />
    </select>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #e5e7eb;
}

.label {
  color: #9ca3af;
}

.select {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #d0d0d0;
  padding: 0.45rem 0.6rem;
  background: #ffffff;          /* fondo blanco */
  color: #111827;               /* texto oscuro */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.select:focus {
  outline: none;
  border-color: #00c853;        /* verde suave al foco */
}
</style>
