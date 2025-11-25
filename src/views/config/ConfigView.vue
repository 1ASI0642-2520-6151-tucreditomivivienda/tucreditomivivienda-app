<script setup>
import { reactive, computed } from 'vue'
import { useConfigStore } from '../../stores/configStore'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseSelect from '../../components/ui/BaseSelect.vue'
import BaseButton from '../../components/ui/BaseButton.vue'

const configStore = useConfigStore()

// Copia editable de la config
const form = reactive({
  currency: configStore.config.currency,
  rateType: configStore.config.rateType,
  rateValue: configStore.config.rateValue,
  capitalization: configStore.config.capitalization,
  termMonths: configStore.config.termMonths,
  graceType: configStore.config.graceType,
  graceMonths: configStore.config.graceMonths
})

const isNominal = computed(() => form.rateType === 'nominal')
const hasGrace = computed(() => form.graceType !== 'sin')

function saveConfig() {
  // convertir strings numéricos a números
  const cleaned = {
    ...form,
    rateValue: Number(form.rateValue),
    termMonths: Number(form.termMonths),
    graceMonths: Number(form.graceMonths)
  }

  configStore.updateConfig(cleaned)
  alert('Configuración guardada')
}

function resetConfig() {
  configStore.resetConfig()
  Object.assign(form, configStore.config)
}
</script>

<template>
  <section class="config">
    <header class="header">
      <div>
        <h1>Configuración del crédito</h1>
        <p class="subtitle">
          Define moneda, tipo de tasa, capitalización y periodos de gracia que usarán las
          simulaciones.
        </p>
      </div>
    </header>

    <form class="grid" @submit.prevent="saveConfig">
      <div class="card">
        <h2>Datos generales</h2>
        <div class="fields">
          <BaseSelect v-model="form.currency" label="Moneda">
            <option value="PEN">Soles (PEN)</option>
            <option value="USD">Dólares (USD)</option>
          </BaseSelect>

          <BaseInput
              v-model="form.termMonths"
              label="Plazo del crédito (meses)"
              type="number"
              min="1"
          />
        </div>
      </div>

      <div class="card">
        <h2>Tasa de interés</h2>
        <div class="fields">
          <BaseSelect v-model="form.rateType" label="Tipo de tasa">
            <option value="efectiva">Tasa efectiva anual (TEA)</option>
            <option value="nominal">Tasa nominal anual (TNA)</option>
          </BaseSelect>

          <BaseInput
              v-model="form.rateValue"
              label="Valor de la tasa (%)"
              type="number"
              min="0"
              step="0.01"
          />

          <BaseSelect
              v-if="isNominal"
              v-model="form.capitalization"
              label="Capitalización de la TNA"
          >
            <option value="mensual">Mensual</option>
            <option value="bimestral">Bimestral</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
          </BaseSelect>
        </div>
      </div>

      <div class="card">
        <h2>Periodo de gracia</h2>
        <div class="fields">
          <BaseSelect v-model="form.graceType" label="Tipo de gracia">
            <option value="sin">Sin gracia</option>
            <option value="total">Gracia total</option>
            <option value="parcial">Gracia parcial</option>
          </BaseSelect>

          <BaseInput
              v-if="hasGrace"
              v-model="form.graceMonths"
              label="Meses de gracia"
              type="number"
              min="0"
          />
        </div>
      </div>

      <div class="actions">
        <BaseButton variant="primary" type="submit">Guardar configuración</BaseButton>
        <BaseButton variant="outline" type="button" @click="resetConfig">
          Restablecer valores por defecto
        </BaseButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.config {
  color: #e5e7eb;
}

.header {
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 1.6rem;
  margin-bottom: 0.3rem;
}

.subtitle {
  color: #9ca3af;
  font-size: 0.9rem;
}

.grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 900px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.card {
  background: #020617;
  border-radius: 0.75rem;
  border: 1px solid #1f2937;
  padding: 1rem;
}

.card h2 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
</style>
