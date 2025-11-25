// src/stores/loanStore.js
import { defineStore } from 'pinia'

export const useLoanStore = defineStore('loan', {
    state: () => ({
        currentSimulation: null
    }),
    actions: {
        setSimulation(simulation) {
            this.currentSimulation = simulation
        },
        clearSimulation() {
            this.currentSimulation = null
        }
    }
})
