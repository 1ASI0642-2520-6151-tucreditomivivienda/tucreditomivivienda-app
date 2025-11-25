<script setup>
import { reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertyStore } from '../../stores/propertyStore'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseSelect from '../../components/ui/BaseSelect.vue'
import BaseButton from '../../components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const propertyStore = usePropertyStore()

const editingId = computed(() => route.params.id)
const isEdit = computed(() => !!editingId.value)

const form = reactive({
  proyecto: '',
  torre: '',
  numero: '',
  ciudad: '',
  tipoUnidad: '',
  areaM2: '',
  dormitorios: '',
  banos: '',
  precioVenta: '',
  estado: 'disponible'
})

onMounted(async () => {
  await propertyStore.loadProperties()
  if (isEdit.value) {
    const existing = propertyStore.getById(editingId.value)
    if (!existing) {
      alert('Unidad no encontrada')
      router.push({ name: 'properties' })
      return
    }
    Object.assign(form, {
      proyecto: existing.proyecto || '',
      torre: existing.torre || '',
      numero: existing.numero || '',
      ciudad: existing.ciudad || '',
      tipoUnidad: existing.tipoUnidad || '',
      areaM2: existing.areaM2 ?? '',
      dormitorios: existing.dormitorios ?? '',
      banos: existing.banos ?? '',
      precioVenta: existing.precioVenta ?? '',
      estado: existing.estado || 'disponible'
    })
  }
})

function validateForm() {
  if (!form.proyecto || !form.numero || !form.precioVenta) {
    alert('Proyecto, número y precio de venta son obligatorios.')
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validateForm()) return

  const payload = {
    ...form,
    areaM2: Number(form.areaM2) || 0,
    dormitorios: Number(form.dormitorios) || 0,
    banos: Number(form.banos) || 0,
    precioVenta: Number(form.precioVenta) || 0
  }

  if (isEdit.value) {
    await propertyStore.updateProperty(editingId.value, payload)
  } else {
    await propertyStore.addProperty(payload)
  }

  router.push({ name: 'properties' })
}

function handleCancel() {
  router.push({ name: 'properties' })
}
</script>

<template>
  <section class="property-form">
    <header class="header">
      <div>
        <h1>{{ isEdit ? 'Editar unidad' : 'Nueva unidad inmobiliaria' }}</h1>
        <p class="subtitle">
          Registra los datos de la unidad que se ofrece al cliente.
        </p>
      </div>
    </header>

    <form class="grid" @submit.prevent="handleSubmit">
      <div class="card">
        <h2>Información principal</h2>
        <div class="fields">
          <BaseInput v-model="form.proyecto" label="Proyecto" />
          <BaseInput v-model="form.torre" label="Torre / Bloque" />
          <BaseInput v-model="form.numero" label="Número de unidad" />
          <BaseInput v-model="form.ciudad" label="Ciudad" />
          <BaseSelect v-model="form.tipoUnidad" label="Tipo de unidad">
            <option value="">Selecciona una opción</option>
            <option value="departamento">Departamento</option>
            <option value="casa">Casa</option>
            <option value="duplex">Dúplex</option>
            <option value="loft">Loft</option>
            <option value="local">Local comercial</option>
          </BaseSelect>
        </div>
      </div>

      <div class="card">
        <h2>Detalles técnicos y precio</h2>
        <div class="fields">
          <BaseInput
              v-model="form.areaM2"
              label="Área techada (m²)"
              type="number"
              min="0"
              step="0.01"
          />
          <BaseInput
              v-model="form.dormitorios"
              label="Dormitorios"
              type="number"
              min="0"
          />
          <BaseInput v-model="form.banos" label="Baños" type="number" min="0" />
          <BaseInput
              v-model="form.precioVenta"
              label="Precio de venta (S/)"
              type="number"
              min="0"
              step="0.01"
          />
          <BaseSelect v-model="form.estado" label="Estado">
            <option value="disponible">Disponible</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido</option>
          </BaseSelect>
        </div>
      </div>

      <div class="actions">
        <BaseButton variant="primary" type="submit">
          {{ isEdit ? 'Guardar cambios' : 'Guardar unidad' }}
        </BaseButton>
        <BaseButton variant="outline" type="button" @click="handleCancel">
          Cancelar
        </BaseButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.property-form {
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
