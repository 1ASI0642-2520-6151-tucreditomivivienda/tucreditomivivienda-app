<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLoanStore } from '../../stores/loanStore'
import BaseButton from '../../components/ui/BaseButton.vue'

const loanStore = useLoanStore()
const router = useRouter()

const simulation = computed(() => loanStore.currentSimulation)
const hasSimulation = computed(() => !!simulation.value)

const currencySymbol = computed(
    () => simulation.value?.input.currencySymbol || 'S/'
)

const client = computed(() => simulation.value?.input.selectedClient || null)
const property = computed(
    () => simulation.value?.input.selectedProperty || null
)

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
          <p>
            <span>Bono Techo Propio:</span>
            <strong>{{ formatMoney(simulation.input.bonoTecho) }}</strong>
          </p>
          <p>
            <span>Plazo:</span>
            <strong>{{ simulation.summary.termMonths }} meses</strong>
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
            <span>VAN (a tasa del crédito):</span>
            <strong>{{ formatMoney(simulation.summary.npv) }}</strong>
          </p>
          <p>
            <span>TIR mensual estimada:</span>
            <strong>{{ formatPercent(simulation.summary.irrMonthly) }}</strong>
          </p>
          <p>
            <span>TIR anual estimada:</span>
            <strong>{{ formatPercent(simulation.summary.irrAnnual) }}</strong>
          </p>
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
              <th>Cuota</th>
              <th>Interés</th>
              <th>Amortización</th>
              <th>Saldo final</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="row in simulation.schedule" :key="row.period">
              <td>{{ row.period }}</td>
              <td>{{ formatMoney(row.saldoInicial) }}</td>
              <td>{{ formatMoney(row.cuota) }}</td>
              <td>{{ formatMoney(row.interes) }}</td>
              <td>{{ formatMoney(row.amortizacion) }}</td>
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
  color: #e5e7eb;
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
}

.subtitle {
  color: #9ca3af;
  font-size: 0.9rem;
}

.empty {
  background: #020617;
  border-radius: 0.75rem;
  border: 1px solid #1f2937;
  padding: 1.5rem;
  text-align: center;
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
  background: #020617;
  border-radius: 0.75rem;
  border: 1px solid #1f2937;
  padding: 1rem;
  font-size: 0.9rem;
}

.card h2 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.card p {
  display: flex;
  justify-content: space-between;
  margin: 0 0 0.3rem;
}

.table-card {
  background: #020617;
  border-radius: 0.75rem;
  border: 1px solid #1f2937;
  padding: 1rem;
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
}

th,
td {
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid #111827;
  text-align: right;
}

th:first-child,
td:first-child {
  text-align: center;
}

thead th {
  position: sticky;
  top: 0;
  background: #020617;
}
</style>
