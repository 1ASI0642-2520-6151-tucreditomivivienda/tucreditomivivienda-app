<script setup>
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { name: 'Dashboard', routeName: 'dashboard' },
  { name: 'Clientes', routeName: 'clients' },
  { name: 'Unidades', routeName: 'properties' },
  { name: 'Simulador', routeName: 'simulation-form' },
  { name: 'Configuración', routeName: 'config' }
  // luego: Clientes, Unidades, Simulaciones, etc.
]

function goTo(item) {
  router.push({ name: item.routeName })
}
</script>


<template>
  <aside class="sidebar">
    <nav>
      <ul>
        <li
            v-for="item in menuItems"
            :key="item.routeName"
            :class="{ active: route.name === item.routeName }"
            @click="goTo(item)"
        >
          {{ item.name }}
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background: #ffffff;          /* sidebar blanco */
  border-right: 1px solid #e0e0e0;
  padding: 1rem 0.75rem;
}



ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 0.6rem 0.9rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: #333333;
  cursor: pointer;
}

li:hover {
  background: #f0f0f0;
  color: #000000;
}

li.active {
  background: #00c853;          /* verde del botón Exportar PDF */
  color: white;
}

</style>
