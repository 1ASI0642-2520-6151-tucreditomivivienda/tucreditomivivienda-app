<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLoanStore } from '../../stores/loanStore'
import BaseButton from '../../components/ui/BaseButton.vue'

const loanStore = useLoanStore()
const router = useRouter()

// Estado para mostrar/ocultar TIR y VAN
const showAdvancedMetrics = ref(false)

const simulation = computed(() => loanStore.currentSimulation)
const hasSimulation = computed(() => !!simulation.value)

const currencySymbol = computed(
    () => simulation.value?.input.currencySymbol || 'S/'
)

const client = computed(() => simulation.value?.input.selectedClient || null)
const property = computed(
    () => simulation.value?.input.selectedProperty || null
)

// Configuración de la simulación
const config = computed(() => simulation.value?.input?.configSnapshot || {})
const termMonths = computed(() => simulation.value?.summary?.termMonths || 0)
const monthlyRate = computed(() => simulation.value?.summary?.monthlyRate || 0)

// Calcular TEA desde la configuración
const tea = computed(() => {
  if (!config.value.rateValue) return 0
  const rate = Number(config.value.rateValue) / 100
  
  if (config.value.rateType === 'efectiva') {
    return rate
  }
  
  // Si es nominal, convertir a TEA
  const m = getCapitalizationsPerYear(config.value.capitalization || 'mensual')
  return Math.pow(1 + rate / m, m) - 1
})

// TEM calculado desde TEA: TEM = (1 + TEA)^(1/12) - 1
const tem = computed(() => {
  if (tea.value <= 0) return 0
  return Math.pow(1 + tea.value, 1 / 12) - 1
})

// Plazo en años
const termYears = computed(() => {
  if (termMonths.value < 12) return null
  return (termMonths.value / 12).toFixed(1)
})

// Información de periodo de gracia
const graceInfo = computed(() => {
  const graceType = config.value.graceType || 'sin'
  const graceMonths = Number(config.value.graceMonths) || 0
  
  if (graceType === 'sin') {
    return { label: 'Sin periodo de gracia', months: 0 }
  }
  
  const typeLabels = {
    total: 'Gracia total',
    parcial: 'Gracia parcial'
  }
  
  return {
    label: typeLabels[graceType] || 'Gracia',
    months: graceMonths
  }
})

function getCapitalizationsPerYear(capitalization) {
  switch (capitalization) {
    case 'mensual': return 12
    case 'bimestral': return 6
    case 'trimestral': return 4
    case 'semestral': return 2
    case 'anual':
    default: return 1
  }
}

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

function formatPercent(value) {
  if (value == null) return '-'
  return (value * 100).toFixed(2) + ' %'
}

function goToNewSim() {
  router.push({ name: 'simulation-form' })
}
</script>

<template>
  <section class="sim-result">
    <header class="header">
      <div>
        <h1>Resultados de la simulación</h1>
        <p class="subtitle" v-if="hasSimulation">
          Plan de pagos generado para el cliente y la unidad seleccionados.
        </p>
      </div>

      <BaseButton v-if="hasSimulation" variant="outline" @click="goToNewSim">
        Nueva simulación
      </BaseButton>
    </header>

    <div v-if="!hasSimulation" class="empty">
      <p>No hay ninguna simulación generada.</p>
      <BaseButton variant="primary" @click="goToNewSim">
        Ir al simulador
      </BaseButton>
    </div>

    <div v-else>
      <div class="summary-grid">
        <div class="card">
          <h2>Cliente</h2>
          <p v-if="client">
            <span>Nombre:</span>
            <strong>{{ client.apellidos }}, {{ client.nombres }}</strong>
          </p>
          <p v-if="client">
            <span>Documento:</span>
            <strong>{{ client.documento }}</strong>
          </p>
          <p v-if="client">
            <span>Ingresos mensuales:</span>
            <strong>{{ formatMoney(client.ingresosMensuales) }}</strong>
          </p>
          <p v-if="client">
            <span>Actividad:</span>
            <strong>{{ client.actividadLaboral || '-' }}</strong>
          </p>
          <p v-if="!client">
            <span>Cliente:</span>
            <strong>No asociado</strong>
          </p>
        </div>

        <div class="card">
          <h2>Unidad inmobiliaria</h2>
          <p v-if="property">
            <span>Proyecto:</span>
            <strong>{{ property.proyecto }}</strong>
          </p>
          <p v-if="property">
            <span>Ubicación:</span>
            <strong>{{ property.torre }} {{ property.numero }} – {{ property.ciudad }}</strong>
          </p>
          <p v-if="property">
            <span>Tipo:</span>
            <strong>{{ property.tipoUnidad || '-' }}</strong>
          </p>
          <p v-if="property">
            <span>Área:</span>
            <strong>{{ property.areaM2 }} m²</strong>
          </p>
          <p v-if="property">
            <span>Precio lista:</span>
            <strong>{{ formatMoney(property.precioVenta) }}</strong>
          </p>
          <p v-if="!property">
            <span>Unidad:</span>
            <strong>No asociada</strong>
          </p>
        </div>

        <div class="card">
          <h2>Crédito</h2>
          <p>
            <span>Monto financiado:</span>
            <strong>{{ formatMoney(simulation.input.loanAmount) }}</strong>
          </p>
          <p>
            <span>Precio de la unidad:</span>
            <strong>{{ formatMoney(simulation.input.propertyPrice) }}</strong>
          </p>
          <p>
            <span>Cuota inicial:</span>
            <strong>{{ formatMoney(simulation.input.initialAmount) }}</strong>
          </p>
          <p v-if="simulation.input.bonoTecho > 0">
            <span>Bono Techo Propio:</span>
            <strong>{{ formatMoney(simulation.input.bonoTecho) }}</strong>
          </p>
          <p v-if="simulation.input.bonoBBP > 0">
            <span>Bono del Buen Pagador (BBP):</span>
            <strong>{{ formatMoney(simulation.input.bonoBBP || 0) }}</strong>
          </p>
          <p v-if="simulation.input.bonoBFH > 0">
            <span>Bono Familiar Habitacional (BFH):</span>
            <strong>{{ formatMoney(simulation.input.bonoBFH || 0) }}</strong>
          </p>
          <p v-if="termYears">
            <span>Plazo:</span>
            <strong>{{ termYears }} años</strong>
          </p>
          <p>
            <span>Plazo:</span>
            <strong>{{ termMonths }} meses</strong>
          </p>
          <p>
            <span>Periodo de gracia:</span>
            <strong>
              {{ graceInfo.label }}
              <template v-if="graceInfo.months > 0">
                ({{ graceInfo.months }} {{ graceInfo.months === 1 ? 'mes' : 'meses' }})
              </template>
            </strong>
          </p>
        </div>

        <div class="card">
          <h2>Indicadores</h2>
          <p>
            <span>Total pagado:</span>
            <strong>{{ formatMoney(simulation.summary.totalPaid) }}</strong>
          </p>
          <p>
            <span>Intereses totales:</span>
            <strong>{{ formatMoney(simulation.summary.totalInterest) }}</strong>
          </p>
          <p>
            <span>TEA (Tasa Efectiva Anual):</span>
            <strong>{{ formatPercent(tea) }}</strong>
          </p>
          <p>
            <span>TEM (Tasa Efectiva Mensual):</span>
            <strong>{{ formatPercent(tem) }}</strong>
          </p>
          <div class="advanced-metrics-toggle" @click="showAdvancedMetrics = !showAdvancedMetrics">
            <span class="toggle-text">
              {{ showAdvancedMetrics ? 'Ocultar' : 'Mostrar' }} métricas avanzadas
            </span>
            <span class="toggle-icon">{{ showAdvancedMetrics ? '▼' : '▶' }}</span>
          </div>
          <div v-if="showAdvancedMetrics" class="advanced-metrics">
            <p>
              <span>VAN (a tasa del crédito):</span>
              <strong>{{ formatMoney(simulation.summary.npv) }}</strong>
            </p>
            <p>
              <span>TIR anual estimada:</span>
              <strong>{{ formatPercent(simulation.summary.irrAnnual) }}</strong>
            </p>
          </div>
        </div>
      </div>

      <div class="table-card">
        <h2>Tabla de amortización (método francés)</h2>
        <div class="table-wrapper">
          <table>
            <thead>
            <tr>
              <th>Periodo</th>
              <th>Saldo inicial</th>
              <th>Interés</th>
              <th>Amortización</th>
              <th>Cuota</th>
              <th>Saldo final</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="row in simulation.schedule" :key="row.period">
              <td>{{ row.period }}</td>
              <td>{{ formatMoney(row.saldoInicial) }}</td>
              <td>{{ formatMoney(row.interes) }}</td>
              <td>{{ formatMoney(row.amortizacion) }}</td>
              <td>{{ formatMoney(row.cuota) }}</td>
              <td>{{ formatMoney(row.saldoFinal) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sim-result {
  color: #111827;
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
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

.empty {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;
  padding: 1.5rem;
  text-align: center;
  color: #111827;
}

.summary-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.card {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;
  padding: 1rem;
  font-size: 0.9rem;
  color: #111827;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
}

.card h2 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: #000000;
  font-weight: 700;
}

.card p {
  display: flex;
  justify-content: space-between;
  margin: 0 0 0.3rem;
  color: #111827;
}

.card p span {
  color: #6b7280;
}

.card p strong {
  color: #111827;
  font-weight: 600;
}

.table-card {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
}

.table-card h2 {
  color: #000000;
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.table-wrapper {
  max-height: 420px;
  overflow: auto;
  margin-top: 0.75rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  color: #111827;
  table-layout: fixed;
}

th,
td {
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid #e5e5e5;
  text-align: right;
  color: #111827;
}

/* Columna Periodo - muy pequeña */
th:first-child,
td:first-child {
  width: 50px;
  min-width: 50px;
  max-width: 50px;
  text-align: center;
  padding: 0.4rem 0.25rem;
}

/* Saldo inicial - más espacio */
th:nth-child(2),
td:nth-child(2) {
  width: 18%;
}

/* Interés - más espacio */
th:nth-child(3),
td:nth-child(3) {
  width: 18%;
}

/* Amortización - más espacio */
th:nth-child(4),
td:nth-child(4) {
  width: 18%;
}

/* Cuota - más espacio */
th:nth-child(5),
td:nth-child(5) {
  width: 18%;
}

/* Saldo final - más espacio */
th:nth-child(6),
td:nth-child(6) {
  width: 18%;
}

thead th {
  position: sticky;
  top: 0;
  background: #ffffff;
  font-weight: 600;
  color: #000000;
}
</style>
