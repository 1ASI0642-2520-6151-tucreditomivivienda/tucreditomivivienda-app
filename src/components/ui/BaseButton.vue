<script setup>
const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | outline
  type: { type: String, default: 'button' }
})
</script>

<template>
  <button
      :type="type"
      class="btn"
      :class="{
      'btn-primary': variant === 'primary',
      'btn-outline': variant === 'outline'
    }"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  padding: 0.55rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background: #00c853;          /* verde principal */
  color: white;
}

.btn-primary:hover {
  background: #00b34a;          /* verde un poco más oscuro al pasar el mouse */
}


.btn-outline {
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #111827;          /* texto oscuro y legible */
}

.btn-outline:hover:not(:disabled) {
  background: #f3f4f6;
}
</style>
