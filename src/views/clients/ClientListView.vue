<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore } from '../../stores/clientStore'
import BaseButton from '../../components/ui/BaseButton.vue'

const router = useRouter()
const clientStore = useClientStore()

onMounted(() => {
  clientStore.loadClients()
})

function goNew() {
  router.push({ name: 'client-new' })
}

function editClient(id) {
  router.push({ name: 'client-edit', params: { id } })
}

async function deleteClient(id) {
  if (!confirm('¿Eliminar este cliente?')) return
  await clientStore.removeClient(id)
}

function simulateClient(id) {
  router.push({
    name: 'simulation-form',
    query: { clientId: id }
  })
}
</script>

<template>
  <section class="clients">
    <header class="header">
      <div>
        <h1>Clientes</h1>
        <p class="subtitle">
          Registra la información socioeconómica de los posibles compradores.
        </p>
      </div>

      <BaseButton variant="primary" @click="goNew">Nuevo cliente</BaseButton>
    </header>

    <div v-if="clientStore.loading" class="state-msg">
      Cargando clientes...
    </div>
    <div v-else-if="clientStore.sortedClients.length === 0" class="state-msg">
      No hay clientes registrados.
    </div>
    <div v-else class="table-card">
      <div class="table-wrapper">
        <table>
          <thead>
          <tr>
            <th>Documento</th>
            <th>Apellidos</th>
            <th>Nombres</th>
            <th>Ingresos mensuales (S/)</th>
            <th>Actividad</th>
            <th>Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="c in clientStore.sortedClients" :key="c.id">
            <td>{{ c.documento }}</td>
            <td>{{ c.apellidos }}</td>
            <td>{{ c.nombres }}</td>
            <td>
              {{
                Number(c.ingresosMensuales || 0).toLocaleString('es-PE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              }}
            </td>
            <td>{{ c.actividadLaboral }}</td>
            <td class="actions">
              <button class="a" @click="simulateClient(c.id)">Simular</button>
              <button class="a" @click="editClient(c.id)">Editar</button>
              <button class="a danger" @click="deleteClient(c.id)">
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
.clients {
  color: #111827;
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
  color: #000000;
  font-weight: 700;
}
.subtitle {
  color: #6b7280;
  font-size: 0.9rem;
}
.state-msg {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;
  padding: 1.5rem;
  text-align: center;
  color: #111827;
}
.table-card {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
}
.table-wrapper {
  overflow: auto;
  max-height: 450px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  color: #111827;
}
th,
td {
  padding: 0.45rem 0.5rem;
  border-bottom: 1px solid #e5e5e5;
  text-align: left;
  color: #111827;
}
th {
  position: sticky;
  top: 0;
  background: #ffffff;
  font-weight: 600;
  color: #000000;
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
