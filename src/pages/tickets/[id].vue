<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="!ticket">Ticket not found</div>
    <div v-else>
      <h1>Ticket {{ ticket.id }}</h1>
      <p><strong>Category:</strong> {{ ticket.category }}</p>
      <p><strong>Description:</strong> {{ ticket.description }}</p>
      <p><strong>Address:</strong> {{ ticket.address }}</p>
      <p><strong>Status:</strong> {{ ticket.status }}</p>
      <p><strong>Resident ID:</strong> {{ ticket.resident_id }}</p>
      <p><strong>Created:</strong> {{ ticket.created_at }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ApiClient } from '~/api/apiClient'
import type { components } from '~/api/api'

type Ticket = components["schemas"]["Ticket"]

const api = new ApiClient('https://backend-pl4x.onrender.com')
const route = useRoute()

const ticket = ref<Ticket | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const res = await api.getTicketById(id)
    ticket.value = res.data ?? null
  } catch (e: any) {
    error.value = e.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})
</script>