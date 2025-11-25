<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore } from '../../stores/clientStore'
import { usePropertyStore } from '../../stores/propertyStore'
import { useConfigStore } from '../../stores/configStore'
import { useLoanStore } from '../../stores/loanStore'
import BaseButton from '../../components/ui/BaseButton.vue'

const router = useRouter()
const clientStore = useClientStore()
const propertyStore = usePropertyStore()
const configStore = useConfigStore()
const loanStore = useLoanStore()

onMounted(async () => {
  // Cargamos datos básicos para las tarjetas
  await Promise.all([
    clientStore.loadClients(),
    propertyStore.loadProperties()
  ])
})

const totalClients = computed(() => clientStore.items.length)

const totalProperties = computed(() => propertyStore.items.length)

const availableUnits = computed(() =>
    propertyStore.items.filter((p) => p.estado === 'disponible').length
)

const averagePrice = computed(() => {
  if (!propertyStore.items.length) return 0
  const sum = propertyStore.items.reduce(
      (acc, p) => acc + (Number(p.precioVenta) || 0),
      0
  )
  return sum / propertyStore.items.length
})

const currencyLabel = computed(() =>
    configStore.config.currency === 'PEN' ? 'Soles (PEN)' : 'Dólares (USD)'
)

const graceLabel = computed(() => {
  const type = configStore.config.graceType
  if (type === 'sin') return 'Sin gracia'
  if (type === 'total') return `Gracia total (${configStore.config.graceMonths} meses)`
  if (type === 'parcial') return `Gracia parcial (${configStore.config.graceMonths} meses)`
  return '-'
})

const lastSimulation = computed(() => loanStore.currentSimulation)

const lastSimClient = computed(
    () => lastSimulation.value?.input.selectedClient || null
)

const lastSimProperty = computed(
    () => lastSimulation.value?.input.selectedProperty || null
)

const currencySymbol = computed(
    () => lastSimulation.value?.input.currencySymbol || 'S/'
)

// Busco una cuota “normal” (primer periodo con cuota > 0)
const regularInstallment = computed(() => {
  const sim = lastSimulation.value
  if (!sim) return null
  const row = sim.schedule.find((r) => r.cuota > 0.01)
  return row ? row.cuota : null
})

function formatMoney(value, symbolOverride) {
  const symbol = symbolOverride ?? currencySymbol.value
  return (
      symbol +
      ' ' +
      (Number(value) || 0).toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
  )
}

function formatMoneyConfig(value) {
  // Para precios de unidades (usamos soles como referencia visual)
  return (
      'S/ ' +
      (Number(value) || 0).toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
  )
}

function formatPercent(value) {
  if (value == null) return '-'
  return value.toFixed(2) + ' %'
}

function goTo(routeName) {
  router.push({ name: routeName })
}
</script>

<template>
  <section class="dashboard">
    <header class="header">
      <div>
        <h1>Panel general</h1>
        <p class="subtitle">
          Resumen rápido de clientes, unidades y simulaciones para la caseta de ventas.
        </p>
      </div>
    </header>

    <!-- Tarjetas de métricas principales -->
    <div class="cards-row">
      <div class="card kpi">
        <h2>Total de clientes</h2>
        <p class="value">{{ totalClients }}</p>
        <p class="hint">Registros con información socioeconómica.</p>
      </div>

      <div class="card kpi">
        <h2>Unidades registradas</h2>
        <p class="value">{{ totalProperties }}</p>
        <p class="hint">Departamentos / casas del portafolio.</p>
      </div>

      <div class="card kpi">
        <h2>Unidades disponibles</h2>
        <p class="value available">{{ availableUnits }}</p>
        <p class="hint">En estado “disponible”.</p>
      </div>

      <div class="card kpi">
        <h2>Precio promedio unidad</h2>
        <p class="value">
          {{ formatMoneyConfig(averagePrice) }}
        </p>
        <p class="hint">Promedio simple de precio de venta.</p>
      </div>
    </div>

    <!-- Configuración actual + última simulación -->
    <div class="cards-row secondary">
      <div class="card">
        <h2>Configuración actual del crédito</h2>
        <div class="config-list">
          <p>
            <span>Moneda:</span>
            <strong>{{ currencyLabel }}</strong>
          </p>
          <p>
            <span>Plazo:</span>
            <strong>{{ configStore.config.termMonths }} meses</strong>
          </p>
          <p>
            <span>Tipo de tasa:</span>
            <strong>
              {{
                configStore.config.rateType === 'efectiva'
                    ? 'Efectiva anual (TEA)'
                    : 'Nominal anual (TNA)'
              }}
            </strong>
          </p>
          <p>
            <span>Valor de tasa:</span>
            <strong>{{ configStore.config.rateValue }} %</strong>
          </p>
          <p v-if="configStore.config.rateType === 'nominal'">
            <span>Capitalización:</span>
            <strong>{{ configStore.config.capitalization }}</strong>
          </p>
          <p>
            <span>Periodo de gracia:</span>
            <strong>{{ graceLabel }}</strong>
          </p>
        </div>

        <div class="config-actions">
          <BaseButton variant="outline" @click="goTo('config')">
            Ajustar configuración
          </BaseButton>
        </div>
      </div>

      <div class="card">
        <h2>Última simulación generada</h2>

        <div v-if="!lastSimulation" class="no-sim">
          <p>No se ha generado ninguna simulación todavía.</p>
          <BaseButton variant="primary" @click="goTo('simulation-form')">
            Ir al simulador
          </BaseButton>
        </div>

        <div v-else class="sim-details">
          <div class="sim-section">
            <h3>Cliente</h3>
            <p v-if="lastSimClient">
              <span>Nombre:</span>
              <strong>
                {{ lastSimClient.apellidos }}, {{ lastSimClient.nombres }}
              </strong>
            </p>
            <p v-if="lastSimClient">
              <span>Documento:</span>
              <strong>{{ lastSimClient.documento }}</strong>
            </p>
            <p v-if="lastSimClient">
              <span>Ingresos mensuales:</span>
              <strong>
                {{ formatMoney(lastSimClient.ingresosMensuales, currencySymbol) }}
              </strong>
            </p>
            <p v-if="!lastSimClient">
              <span>Cliente:</span>
              <strong>No asociado</strong>
            </p>
          </div>

          <div class="sim-section">
            <h3>Unidad</h3>
            <p v-if="lastSimProperty">
              <span>Proyecto:</span>
              <strong>{{ lastSimProperty.proyecto }}</strong>
            </p>
            <p v-if="lastSimProperty">
              <span>Ubicación:</span>
              <strong>
                {{ lastSimProperty.torre }} {{ lastSimProperty.numero }} –
                {{ lastSimProperty.ciudad }}
              </strong>
            </p>
            <p v-if="lastSimProperty">
              <span>Precio lista:</span>
              <strong>
                {{ formatMoney(lastSimProperty.precioVenta, currencySymbol) }}
              </strong>
            </p>
            <p v-if="!lastSimProperty">
              <span>Unidad:</span>
              <strong>No asociada</strong>
            </p>
          </div>

          <div class="sim-section">
            <h3>Crédito</h3>
            <p>
              <span>Monto financiado:</span>
              <strong>
                {{ formatMoney(lastSimulation.summary.principal, currencySymbol) }}
              </strong>
            </p>
            <p>
              <span>Cuota inicial:</span>
              <strong>
                {{ formatMoney(lastSimulation.input.initialAmount, currencySymbol) }}
              </strong>
            </p>
            <p v-if="regularInstallment">
              <span>Cuota mensual aproximada:</span>
              <strong>{{ formatMoney(regularInstallment, currencySymbol) }}</strong>
            </p>
            <p>
              <span>TIR anual:</span>
              <strong>
                {{
                  lastSimulation.summary.irrAnnual != null
                      ? formatPercent(lastSimulation.summary.irrAnnual * 100)
                      : '-'
                }}
              </strong>
            </p>
          </div>

          <div class="sim-actions">
            <BaseButton variant="primary" @click="goTo('simulation-result')">
              Ver detalle completo
            </BaseButton>
            <BaseButton variant="outline" @click="goTo('simulation-form')">
              Nueva simulación
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones rápidas -->
    <div class="card quick-actions">
      <h2>Accesos rápidos</h2>
      <p class="subtitle-small">
        Atajos para el uso diario en la caseta de ventas.
      </p>
      <div class="buttons">
        <BaseButton variant="primary" @click="goTo('clients')">
          Ver clientes
        </BaseButton>
        <BaseButton variant="primary" @click="goTo('properties')">
          Ver unidades
        </BaseButton>
        <BaseButton variant="primary" @click="goTo('simulation-form')">
          Simular crédito
        </BaseButton>
        <BaseButton variant="outline" @click="goTo('config')">
          Configurar crédito
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  color: #111827;
}

.header {
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

/* Filas de tarjetas */
.cards-row {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 900px) {
  .cards-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.cards-row.secondary {
  grid-template-columns: 1fr;
}

@media (min-width: 1100px) {
  .cards-row.secondary {
    grid-template-columns: 1.2fr 1.4fr;
  }
}

.card {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;
  padding: 1.25rem;
  color: #111827;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
}

.card h2 {
  color: #000000;
  font-weight: 700;
}

h1,
h2,
h3,
p,
span,
strong {
  color: #111827;
}

/* Tarjetas KPI */
.kpi h2 {
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  color: #000000;
  font-weight: 700;
}

.value {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
  color: #111827;
}

.value.available {
  color: #4ade80;
}

.hint {
  font-size: 0.8rem;
  color: #6b7280;
}

/* Config */
.config-list {
  font-size: 0.9rem;
}

.config-list p {
  display: flex;
  justify-content: space-between;
  margin: 0 0 0.35rem;
}

.config-list span {
  color: #6b7280;
}

.config-actions {
  margin-top: 0.9rem;
}

/* Última simulación */
.no-sim {
  font-size: 0.9rem;
}

.no-sim p {
  margin-bottom: 0.8rem;
}

.sim-details {
  display: grid;
  gap: 0.75rem;
  font-size: 0.85rem;
}

@media (min-width: 1100px) {
  .sim-details {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.sim-section h3 {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #000000;
  font-weight: 600;
}

.sim-section p {
  display: flex;
  justify-content: space-between;
  margin: 0 0 0.3rem;
}

.sim-section span {
  color: #6b7280;
}

.sim-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
}

/* Acciones rápidas */
.quick-actions h2 {
  font-size: 1rem;
  margin-bottom: 0.4rem;
  color: #000000;
  font-weight: 700;
}

.subtitle-small {
  color: #6b7280;
  font-size: 0.85rem;
  margin-bottom: 0.8rem;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}
</style>
