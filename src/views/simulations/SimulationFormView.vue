<script setup>
import { computed, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfigStore } from '../../stores/configStore'
import { useLoanStore } from '../../stores/loanStore'
import { useClientStore } from '../../stores/clientStore'
import { usePropertyStore } from '../../stores/propertyStore'
import { generateFrenchSchedule } from '../../services/loanService'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseSelect from '../../components/ui/BaseSelect.vue'
import BaseButton from '../../components/ui/BaseButton.vue'

const configStore = useConfigStore()
const loanStore = useLoanStore()
const clientStore = useClientStore()
const propertyStore = usePropertyStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  propertyPrice: 250000,
  initialPercent: 10,
  bonoTecho: 0
})

const state = reactive({
  selectedClientId: '',
  selectedPropertyId: ''
})

const currencySymbol = computed(() =>
    configStore.config.currency === 'PEN' ? 'S/' : '$'
)

const initialAmount = computed(() => {
  const price = Number(form.propertyPrice) || 0
  const perc = Number(form.initialPercent) || 0
  return (price * perc) / 100
})

const loanAmount = computed(() => {
  const price = Number(form.propertyPrice) || 0
  const bono = Number(form.bonoTecho) || 0
  const ci = initialAmount.value
  const result = price - ci - bono
  return result > 0 ? result : 0
})

const clients = computed(() => clientStore.sortedClients)
const properties = computed(() => propertyStore.sortedProperties)

function formatMoney(value) {
  return (
      currencySymbol.value +
      ' ' +
      (Number(value) || 0).toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
  )
}

onMounted(async () => {
  await Promise.all([
    clientStore.loadClients(),
    propertyStore.loadProperties()
  ])

  // Si viene un cliente / unidad por query, los preseleccionamos
  const clientIdFromQuery = route.query.clientId
  if (typeof clientIdFromQuery === 'string') {
    state.selectedClientId = clientIdFromQuery
  }

  const propertyIdFromQuery = route.query.propertyId
  if (typeof propertyIdFromQuery === 'string') {
    state.selectedPropertyId = propertyIdFromQuery
    const p = propertyStore.getById(propertyIdFromQuery)
    if (p) {
      form.propertyPrice = p.precioVenta
    }
  }
})

// Cuando cambie la unidad seleccionada, actualizamos el precio
watch(
    () => state.selectedPropertyId,
    (newId) => {
      const p = propertyStore.getById(newId)
      if (p) {
        form.propertyPrice = p.precioVenta
      }
    }
)

function handleSimulate() {
  if (!state.selectedClientId) {
    alert('Selecciona un cliente para la simulación.')
    return
  }

  if (loanAmount.value <= 0) {
    alert('El monto a financiar debe ser mayor a cero.')
    return
  }

  const selectedClient = clientStore.getById(state.selectedClientId) || null
  const selectedProperty = state.selectedPropertyId
      ? propertyStore.getById(state.selectedPropertyId)
      : null

  const { schedule, summary, cashFlows } = generateFrenchSchedule(
      loanAmount.value,
      configStore.config
  )

  loanStore.setSimulation({
    input: {
      ...form,
      loanAmount: loanAmount.value,
      initialAmount: initialAmount.value,
      bonoTecho: Number(form.bonoTecho) || 0,
      configSnapshot: { ...configStore.config },
      currencySymbol: currencySymbol.value,
      selectedClient,
      selectedProperty
    },
    schedule,
    summary,
    cashFlows
  })

  router.push({ name: 'simulation-result' })
}
</script>

<template>
  <section class="sim-form">
    <header class="header">
      <div>
        <h1>Simulador de crédito MiVivienda</h1>
        <p class="subtitle">
          Selecciona un cliente, una unidad (opcional) y define los datos económicos.
          La simulación usará la configuración actual del crédito.
        </p>
      </div>

      <div class="config-summary">
        <p>
          <strong>Moneda:</strong>
          {{ configStore.config.currency === 'PEN' ? 'Soles' : 'Dólares' }}
        </p>
        <p>
          <strong>Plazo:</strong> {{ configStore.config.termMonths }} meses
        </p>
        <p>
          <strong>Tasa:</strong>
          {{ configStore.config.rateValue }}% /
          {{ configStore.config.rateType === 'efectiva' ? 'TEA' : 'TNA' }}
        </p>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <h2>Cliente y unidad</h2>
        <div class="fields">
          <BaseSelect v-model="state.selectedClientId" label="Cliente">
            <option value="">Selecciona un cliente</option>
            <option
                v-for="c in clients"
                :key="c.id"
                :value="c.id"
            >
              {{ c.apellidos }}, {{ c.nombres }} ({{ c.documento }})
            </option>
          </BaseSelect>

          <BaseSelect
              v-model="state.selectedPropertyId"
              label="Unidad inmobiliaria (opcional)"
          >
            <option value="">Sin unidad asociada</option>
            <option
                v-for="p in properties"
                :key="p.id"
                :value="p.id"
            >
              {{ p.proyecto }} - {{ p.torre }} {{ p.numero }} ({{ p.ciudad }})
            </option>
          </BaseSelect>
        </div>
      </div>

      <div class="card">
        <h2>Datos de la unidad</h2>
        <div class="fields">
          <BaseInput
              v-model="form.propertyPrice"
              :label="`Precio de la unidad (${currencySymbol})`"
              type="number"
              min="0"
              step="0.01"
          />
          <BaseInput
              v-model="form.initialPercent"
              label="Porcentaje de cuota inicial (%)"
              type="number"
              min="0"
              max="90"
              step="0.1"
          />
          <BaseInput
              v-model="form.bonoTecho"
              :label="`Bono Techo Propio (${currencySymbol})`"
              type="number"
              min="0"
              step="0.01"
          />
        </div>
      </div>

      <div class="card summary">
        <h2>Resumen del financiamiento</h2>
        <ul>
          <li>
            <span>Cuota inicial aproximada:</span>
            <strong>{{ formatMoney(initialAmount) }}</strong>
          </li>
          <li>
            <span>Monto a financiar:</span>
            <strong>{{ formatMoney(loanAmount) }}</strong>
          </li>
          <li>
            <span>Plazo total:</span>
            <strong>{{ configStore.config.termMonths }} meses</strong>
          </li>
          <li>
            <span>Tipo de gracia:</span>
            <strong>
              {{
                configStore.config.graceType === 'sin'
                    ? 'Sin gracia'
                    : configStore.config.graceType === 'total'
                        ? 'Gracia total'
                        : 'Gracia parcial'
              }}
              <template v-if="configStore.config.graceType !== 'sin'">
                ({{ configStore.config.graceMonths }} meses)
              </template>
            </strong>
          </li>
        </ul>

        <BaseButton
            variant="primary"
            type="button"
            class="btn-simulate"
            @click="handleSimulate"
        >
          Generar plan de pagos
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sim-form {
  color: #111827;  /* texto principal oscuro */
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

h1 {
  font-size: 1.6rem;
  margin-bottom: 0.3rem;
}

.subtitle {
  color: #9ca3af;
  font-size: 0.9rem;
}

.config-summary {
  font-size: 0.85rem;
  background: #ffffff;       /* fondo blanco */
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5; /* borde clarito */
  padding: 0.75rem 1rem;
  color: #111827;            /* texto oscuro */
}


.config-summary p {
  margin: 0;
  margin-bottom: 0.25rem;
}

.grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 1100px) {
  .grid {
    grid-template-columns: 1.3fr 1.3fr 1.2fr;
  }
}

.card {
  background: #f6f6f6;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;    /* borde clarito */
  padding: 1.25rem;
  color: #111827;               /* texto oscuro dentro de la card */
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

.summary ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.summary li {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.btn-simulate {
  width: 100%;
  margin-top: 0.5rem;
}
</style>
