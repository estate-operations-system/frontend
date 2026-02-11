<template>
  <div>
    <h1>Tickets</h1>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>

    <table v-else>
      <tr v-for="ticket in tickets" :key="ticket.id">
        <td>
          <NuxtLink :to="`/tickets/${ticket.id}`">
            {{ ticket.id }}
          </NuxtLink>
        </td>
        <td>{{ ticket.category }}</td>
        <td>{{ ticket.status }}</td>
        <td>{{ ticket.resident_id }}</td>
        <td>{{ ticket.created_at }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiClient } from '~/api/apiClient'
import type { components } from '~/api/api'

type Ticket = components["schemas"]["Ticket"]

const api = new ApiClient('https://backend-pl4x.onrender.com')

const tickets = ref<Ticket[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await api.getTickets()
    tickets.value = res.data ?? []
  } catch (e: any) {
    error.value = e.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})
</script>