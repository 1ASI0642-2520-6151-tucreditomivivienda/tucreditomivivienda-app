import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import AppShell from '../components/layout/AppShell.vue'
import LoginView from '../views/auth/LoginView.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import ConfigView from '../views/config/ConfigView.vue' // 👈 NUEVO
import SimulationFormView from '../views/simulations/SimulationFormView.vue'
import SimulationResultView from '../views/simulations/SimulationResultView.vue'
import ClientListView from '../views/clients/ClientListView.vue'
import ClientFormView from '../views/clients/ClientFormView.vue'
import PropertyListView from '../views/properties/PropertyListView.vue'
import PropertyFormView from '../views/properties/PropertyFormView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { public: true }
        },
        {
            path: '/',
            component: AppShell,
            children: [
                { path: '', redirect: '/dashboard' },
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: DashboardView
                },
                {
                    path: 'config',
                    name: 'config',
                    component: ConfigView
                },
                {
                    path: 'simulations/new',
                    name: 'simulation-form',
                    component: SimulationFormView
                },
                {
                    path: 'simulations/result',
                    name: 'simulation-result',
                    component: SimulationResultView
                },
                {
                    path: 'clients',
                    name: 'clients',
                    component: ClientListView
                },
                {
                    path: 'clients/new',
                    name: 'client-new',
                    component: ClientFormView
                },
                {
                    path: 'clients/:id/edit',
                    name: 'client-edit',
                    component: ClientFormView,
                    props: true
                },
                {
                    path: 'properties',
                    name: 'properties',
                    component: PropertyListView
                },
                {
                    path: 'properties/new',
                    name: 'property-new',
                    component: PropertyFormView
                },
                {
                    path: 'properties/:id/edit',
                    name: 'property-edit',
                    component: PropertyFormView,
                    props: true
                },



            ]
        },
        { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
    ]
})

// mismo beforeEach que ya tenías
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.public) {
        if (to.name === 'login' && authStore.isAuthenticated) {
            return next({ name: 'dashboard' })
        }
        return next()
    }

    if (!authStore.isAuthenticated) {
        return next({ name: 'login' })
    }

    return next()
})

export default router
