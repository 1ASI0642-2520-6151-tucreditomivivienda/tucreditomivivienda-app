<script setup>
import { reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClientStore } from '../../stores/clientStore'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseSelect from '../../components/ui/BaseSelect.vue'
import BaseButton from '../../components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const clientStore = useClientStore()

const editingId = computed(() => route.params.id)
const isEdit = computed(() => !!editingId.value)

const form = reactive({
  nombres: '',
  apellidos: '',
  documento: '',
  estadoCivil: '',
  ingresosMensuales: '',
  dependientes: '',
  actividadLaboral: '',
  telefono: '',
  email: '',
  unidadInteres: ''
})

onMounted(async () => {
  await clientStore.loadClients()
  if (isEdit.value) {
    const existing = clientStore.getById(editingId.value)
    if (!existing) {
      alert('Cliente no encontrado')
      router.push({ name: 'clients' })
      return
    }
    Object.assign(form, {
      nombres: existing.nombres || '',
      apellidos: existing.apellidos || '',
      documento: existing.documento || '',
      estadoCivil: existing.estadoCivil || '',
      ingresosMensuales: existing.ingresosMensuales ?? '',
      dependientes: existing.dependientes ?? '',
      actividadLaboral: existing.actividadLaboral || '',
      telefono: existing.telefono || '',
      email: existing.email || '',
      unidadInteres: existing.unidadInteres || ''
    })
  }
})

function validateForm() {
  if (!form.nombres || !form.apellidos || !form.documento) {
    alert('Nombres, apellidos y documento son obligatorios.')
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validateForm()) return

  const payload = {
    ...form,
    ingresosMensuales: Number(form.ingresosMensuales) || 0,
    dependientes: Number(form.dependientes) || 0
  }

  if (isEdit.value) {
    await clientStore.updateClient(editingId.value, payload)
  } else {
    await clientStore.addClient(payload)
  }

  router.push({ name: 'clients' })
}

function handleCancel() {
  router.push({ name: 'clients' })
}
</script>

<template>
  <section class="client-form">
    <header class="header">
      <div>
        <h1>{{ isEdit ? 'Editar cliente' : 'Nuevo cliente' }}</h1>
        <p class="subtitle">
          Información socioeconómica básica requerida por la inmobiliaria.
        </p>
      </div>
    </header>

    <form class="grid" @submit.prevent="handleSubmit">
      <div class="card">
        <h2>Datos personales</h2>
        <div class="fields">
          <BaseInput v-model="form.nombres" label="Nombres" />
          <BaseInput v-model="form.apellidos" label="Apellidos" />
          <BaseInput v-model="form.documento" label="DNI / Documento" />
          <BaseSelect v-model="form.estadoCivil" label="Estado civil">
            <option value="">Selecciona una opción</option>
            <option value="soltero">Soltero(a)</option>
            <option value="casado">Casado(a)</option>
            <option value="conviviente">Conviviente</option>
            <option value="divorciado">Divorciado(a)</option>
          </BaseSelect>
          <BaseInput v-model="form.telefono" label="Teléfono" />
          <BaseInput v-model="form.email" label="Correo electrónico" />
        </div>
      </div>

      <div class="card">
        <h2>Situación económica</h2>
        <div class="fields">
          <BaseInput
              v-model="form.ingresosMensuales"
              label="Ingresos mensuales aproximados (S/)"
              type="number"
              min="0"
              step="0.01"
          />
          <BaseInput
              v-model="form.dependientes"
              label="Número de dependientes"
              type="number"
              min="0"
          />
          <BaseInput
              v-model="form.actividadLaboral"
              label="Actividad / ocupación principal"
              placeholder="Ej. Empleado, independiente, etc."
          />
          <BaseInput
              v-model="form.unidadInteres"
              label="Unidad / proyecto de interés"
              placeholder="Ej. Torre B, Dpto. 402"
          />
        </div>
      </div>

      <div class="actions">
        <BaseButton variant="primary" type="submit">
          {{ isEdit ? 'Guardar cambios' : 'Guardar cliente' }}
        </BaseButton>
        <BaseButton variant="outline" type="button" @click="handleCancel">
          Cancelar
        </BaseButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.client-form {
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
.grid {
  display: grid;
  gap: 1rem;
}
@media (min-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.card {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;
  padding: 1rem;
  color: #111827;
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
.actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
</style>
