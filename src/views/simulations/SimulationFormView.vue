<script setup>
import { computed, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfigStore } from '../../stores/configStore'
import { useLoanStore } from '../../stores/loanStore'
import { useClientStore } from '../../stores/clientStore'
import { usePropertyStore } from '../../stores/propertyStore'
import { simulateAndSave, adaptBackendResult } from '../../services/loanService'
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
  bonoTecho: 0,
  bonoBBP: 0,
  bonoBFH: 0,
  enableBonoTecho: false,
  enableBonoBBP: false,
  enableBonoBFH: false
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
  const bonoTecho = form.enableBonoTecho ? (Number(form.bonoTecho) || 0) : 0
  const bonoBBP = form.enableBonoBBP ? (Number(form.bonoBBP) || 0) : 0
  const bonoBFH = form.enableBonoBFH ? (Number(form.bonoBFH) || 0) : 0
  const ci = initialAmount.value
  const result = price - ci - bonoTecho - bonoBBP - bonoBFH
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
    propertyStore.loadProperties(),
    loanStore.loadHistory()
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

async function handleDeleteSimulation(id) {
  if (!confirm('¿Estás seguro de eliminar esta simulación del historial?')) {
    return
  }
  try {
    await loanStore.removeSimulation(id)
  } catch (err) {
    alert(err.message || 'Error al eliminar la simulación')
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Función para formatear dinero con la moneda correcta de la simulación
function formatMoneyWithCurrency(value, sim) {
  const currency = sim.currency || sim.Currency || 'PEN'
  const symbol = currency === 'PEN' ? 'S/' : '$'
  return (
      symbol +
      ' ' +
      (Number(value) || 0).toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
  )
}

// Función para obtener el nombre del cliente de una simulación
function getClientName(sim) {
  const clientId = sim.clientId || sim.ClientId
  if (!clientId) return null
  
  const client = clientStore.getById(clientId)
  if (!client) return null
  
  return `${client.apellidos}, ${client.nombres}`
}

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

// Resetear valores de bonos cuando se deshabilitan
watch(
    () => form.enableBonoTecho,
    (enabled) => {
      if (!enabled) form.bonoTecho = 0
    }
)

watch(
    () => form.enableBonoBBP,
    (enabled) => {
      if (!enabled) form.bonoBBP = 0
    }
)

watch(
    () => form.enableBonoBFH,
    (enabled) => {
      if (!enabled) form.bonoBFH = 0
    }
)

async function handleSimulate() {
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

  // Preparar datos de entrada
  const inputData = {
    ...form,
    loanAmount: loanAmount.value,
    initialAmount: initialAmount.value,
    bonoTecho: form.enableBonoTecho ? (Number(form.bonoTecho) || 0) : 0,
    bonoBBP: form.enableBonoBBP ? (Number(form.bonoBBP) || 0) : 0,
    bonoBFH: form.enableBonoBFH ? (Number(form.bonoBFH) || 0) : 0,
    configSnapshot: { ...configStore.config },
    currencySymbol: currencySymbol.value,
    selectedClient,
    selectedProperty
  }

  try {
    // El backend calcula y guarda automáticamente
    const backendResult = await simulateAndSave(
        loanAmount.value,
        configStore.config,
        selectedClient?.id || null,
        selectedProperty?.id || null
    )

    // Adaptar resultado del backend al formato del frontend
    const simulationData = adaptBackendResult(backendResult, inputData)

    // Guardar en el store para mostrar en la vista de resultados
    loanStore.setSimulation(simulationData)

    // Recargar el historial después de guardar
    await loanStore.loadHistory()

    router.push({ name: 'simulation-result' })
  } catch (err) {
    console.error('Error al calcular simulación:', err)
    alert(err.message || 'Error al calcular la simulación. Verifica que el backend esté corriendo.')
  }
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
          <div class="bono-field">
            <div class="bono-checkbox">
              <input
                  type="checkbox"
                  id="bonoTecho"
                  v-model="form.enableBonoTecho"
              />
              <label for="bonoTecho">Bono Techo Propio</label>
            </div>
            <BaseInput
                v-if="form.enableBonoTecho"
                v-model="form.bonoTecho"
                :label="`Bono Techo Propio (${currencySymbol})`"
                type="number"
                min="0"
                step="0.01"
            />
          </div>
          <div class="bono-field">
            <div class="bono-checkbox">
              <input
                  type="checkbox"
                  id="bonoBBP"
                  v-model="form.enableBonoBBP"
              />
              <label for="bonoBBP">Bono del Buen Pagador (BBP)</label>
            </div>
            <BaseInput
                v-if="form.enableBonoBBP"
                v-model="form.bonoBBP"
                :label="`Bono del Buen Pagador - BBP (${currencySymbol})`"
                type="number"
                min="0"
                step="0.01"
            />
          </div>
          <div class="bono-field">
            <div class="bono-checkbox">
              <input
                  type="checkbox"
                  id="bonoBFH"
                  v-model="form.enableBonoBFH"
              />
              <label for="bonoBFH">Bono Familiar Habitacional (BFH)</label>
            </div>
            <BaseInput
                v-if="form.enableBonoBFH"
                v-model="form.bonoBFH"
                :label="`Bono Familiar Habitacional - BFH (${currencySymbol})`"
                type="number"
                min="0"
                step="0.01"
            />
          </div>
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

    <!-- Historial de simulaciones -->
    <div class="history-section">
      <div class="history-header">
        <h2>Historial de simulaciones</h2>
        <BaseButton
            variant="outline"
            size="small"
            @click="loanStore.loadHistory()"
            :disabled="loanStore.loadingHistory"
        >
          {{ loanStore.loadingHistory ? 'Cargando...' : 'Actualizar' }}
        </BaseButton>
      </div>

      <div v-if="loanStore.loadingHistory && loanStore.history.length === 0" class="history-loading">
        <p>Cargando historial...</p>
      </div>

      <div v-else-if="loanStore.error" class="history-error">
        <p>Error: {{ loanStore.error }}</p>
      </div>

      <div v-else-if="loanStore.history.length === 0" class="history-empty">
        <p>No hay simulaciones guardadas aún.</p>
        <p class="hint">Las simulaciones se guardan automáticamente cuando generas un plan de pagos.</p>
      </div>

      <div v-else class="history-grid">
        <div
            v-for="sim in loanStore.history"
            :key="sim.id"
            class="history-card"
        >
          <div class="history-card-header">
            <div class="history-card-title">
              <h3>
                <template v-if="getClientName(sim)">
                  {{ getClientName(sim) }}
                </template>
                <template v-else>
                  Simulación #{{ (sim.id || sim.Id || '').toString().substring(0, 8) || 'N/A' }}
                </template>
              </h3>
              <span class="history-date">{{ formatDate(sim.createdAt || sim.CreatedAt) }}</span>
            </div>
            <BaseButton
                variant="outline"
                size="small"
                @click="handleDeleteSimulation(sim.id || sim.Id)"
            >
              Eliminar
            </BaseButton>
          </div>

          <div class="history-card-content">
            <div class="history-row">
              <span class="label">Monto financiado:</span>
              <strong>{{ formatMoneyWithCurrency(sim.principal || sim.Principal || 0, sim) }}</strong>
            </div>
            <div class="history-row">
              <span class="label">Plazo:</span>
              <strong>{{ sim.termMonths || sim.TermMonths || 0 }} meses</strong>
            </div>
            <div class="history-row">
              <span class="label">Cuota mensual:</span>
              <strong>{{ formatMoneyWithCurrency(sim.monthlyPayment || sim.MonthlyPayment || 0, sim) }}</strong>
            </div>
            <div class="history-row">
              <span class="label">Total pagado:</span>
              <strong>{{ formatMoneyWithCurrency(sim.totalPaid || sim.TotalPaid || 0, sim) }}</strong>
            </div>
            <div class="history-row">
              <span class="label">Intereses totales:</span>
              <strong>{{ formatMoneyWithCurrency(sim.totalInterest || sim.TotalInterest || 0, sim) }}</strong>
            </div>
            <div class="history-row">
              <span class="label">Tasa anual:</span>
              <strong>
                {{ (sim.rateValue || sim.RateValue || 0).toFixed(2) }}% /
                {{ (sim.rateType || sim.RateType || 'efectiva') === 'efectiva' ? 'TEA' : 'TNA' }}
              </strong>
            </div>
          </div>
        </div>
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
  color: #000000;
  font-weight: 700;
}

.subtitle {
  color: #6b7280;
  font-size: 0.9rem;
}

.config-summary {
  font-size: 0.85rem;
  background: #ffffff;       /* fondo blanco */
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5; /* borde clarito */
  padding: 0.75rem 1rem;
  color: #111827;            /* texto oscuro */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
}

.config-summary p {
  margin: 0;
  margin-bottom: 0.25rem;
}

.config-summary strong {
  color: #111827;
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
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;    /* borde clarito */
  padding: 1.25rem;
  color: #111827;               /* texto oscuro dentro de la card */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
}

.card h2 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: #000000;
  font-weight: 700;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bono-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bono-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bono-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.bono-checkbox label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  cursor: pointer;
  user-select: none;
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
  color: #111827;
}

.summary li span {
  color: #6b7280;
}

.summary li strong {
  color: #111827;
  font-weight: 600;
}

.btn-simulate {
  width: 100%;
  margin-top: 0.5rem;
}

.history-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e5e5;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.history-header h2 {
  font-size: 1.3rem;
  color: #000000;
  font-weight: 700;
  margin: 0;
}

.history-loading,
.history-error,
.history-empty {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.history-empty .hint {
  font-size: 0.85rem;
  margin-top: 0.5rem;
  color: #9ca3af;
}

.history-error {
  color: #dc2626;
}

.history-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.history-card {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
}

.history-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e5e5;
}

.history-card-title h3 {
  font-size: 0.95rem;
  color: #000000;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.history-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.history-card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.history-row .label {
  color: #6b7280;
}

.history-row strong {
  color: #111827;
  font-weight: 600;
}
</style>
