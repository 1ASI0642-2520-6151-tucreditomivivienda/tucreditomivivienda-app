<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertyStore } from '../../stores/propertyStore'
import BaseButton from '../../components/ui/BaseButton.vue'

const router = useRouter()
const propertyStore = usePropertyStore()

onMounted(() => {
  propertyStore.loadProperties()
})

function goNew() {
  router.push({ name: 'property-new' })
}

function editProperty(id) {
  router.push({ name: 'property-edit', params: { id } })
}

async function deleteProperty(id) {
  if (!confirm('¿Eliminar esta unidad inmobiliaria?')) return
  await propertyStore.removeProperty(id)
}

function simulateProperty(id) {
  router.push({
    name: 'simulation-form',
    query: { propertyId: id }
  })
}

function formatMoney(value) {
  return (
      'S/ ' +
      (Number(value) || 0).toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
  )
}
</script>

<template>
  <section class="properties">
    <header class="header">
      <div>
        <h1>Unidades inmobiliarias</h1>
        <p class="subtitle">
          Registra los departamentos/casas que ofrece la inmobiliaria.
        </p>
      </div>

      <BaseButton variant="primary" @click="goNew">Nueva unidad</BaseButton>
    </header>

    <div v-if="propertyStore.loading" class="state-msg">
      Cargando unidades...
    </div>
    <div
        v-else-if="propertyStore.sortedProperties.length === 0"
        class="state-msg"
    >
      No hay unidades registradas.
    </div>
    <div v-else class="table-card">
      <div class="table-wrapper">
        <table>
          <thead>
          <tr>
            <th>Proyecto</th>
            <th>Torre</th>
            <th>Número</th>
            <th>Ciudad</th>
            <th>Tipo</th>
            <th>Área (m²)</th>
            <th>Dorms</th>
            <th>Baños</th>
            <th>Precio venta</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="p in propertyStore.sortedProperties" :key="p.id">
            <td>{{ p.proyecto }}</td>
            <td>{{ p.torre }}</td>
            <td>{{ p.numero }}</td>
            <td>{{ p.ciudad }}</td>
            <td>{{ p.tipoUnidad }}</td>
            <td>{{ p.areaM2 }}</td>
            <td>{{ p.dormitorios }}</td>
            <td>{{ p.banos }}</td>
            <td>{{ formatMoney(p.precioVenta) }}</td>
            <td>{{ p.estado }}</td>
            <td class="actions">
              <button class="a" @click="simulateProperty(p.id)">Simular</button>
              <button class="a" @click="editProperty(p.id)">Editar</button>
              <button class="a danger" @click="deleteProperty(p.id)">
                Eliminar
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.properties {
  color: #e5e7eb;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
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
.state-msg {
  background: #020617;
  border-radius: 0.75rem;
  border: 1px solid #1f2937;
  padding: 1.5rem;
  text-align: center;
}
.table-card {
  background: #020617;
  border-radius: 0.75rem;
  border: 1px solid #1f2937;
  padding: 1rem;
}
.table-wrapper {
  overflow: auto;
  max-height: 450px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}
th,
td {
  padding: 0.45rem 0.5rem;
  border-bottom: 1px solid #111827;
  text-align: left;
}
th {
  position: sticky;
  top: 0;
  background: #020617;
}
.actions {
  white-space: nowrap;
}
.a {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  margin-right: 0.4rem;
  font-size: 0.8rem;
}
.a.danger {
  color: #f97373;
}
</style>
