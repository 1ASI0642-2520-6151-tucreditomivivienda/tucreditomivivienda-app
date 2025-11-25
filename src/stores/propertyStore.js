import { defineStore } from 'pinia'
import {
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty
} from '../services/propertyService'

export const usePropertyStore = defineStore('properties', {
    state: () => ({
        items: [],
        loading: false,
        error: null
    }),
    getters: {
        sortedProperties: (state) =>
            [...state.items].sort((a, b) => a.proyecto.localeCompare(b.proyecto))
    },
    actions: {
        async loadProperties() {
            this.loading = true
            this.error = null
            try {
                this.items = await fetchProperties()
            } catch (err) {
                this.error = err.message || 'Error al cargar unidades'
            } finally {
                this.loading = false
            }
        },
        async addProperty(data) {
            const created = await createProperty(data)
            this.items.push(created)
            return created
        },
        async updateProperty(id, data) {
            const updated = await updateProperty(id, data)
            const index = this.items.findIndex((p) => p.id === id)
            if (index !== -1) this.items[index] = updated
            return updated
        },
        async removeProperty(id) {
            await deleteProperty(id)
            this.items = this.items.filter((p) => p.id !== id)
        },
        getById(id) {
            return this.items.find((p) => p.id === id) || null
        }
    }
})
