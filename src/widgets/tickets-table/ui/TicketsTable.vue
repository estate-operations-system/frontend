<template>
  <div style="padding: 20px;">
    <h1>Заявки</h1>

    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Категория</th>
            <th>Описание</th>
            <th>Адрес</th>
            <th>Статус</th>
            <th>ID жителя</th>
            <th>Дата создания</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in tickets" :key="ticket.id">
            <td>{{ ticket.id }}</td>
            <td>{{ ticket.category }}</td>
            <td>{{ ticket.description }}</td>
            <td>{{ ticket.address }}</td>
            <td>{{ ticket.status }}</td>
            <td>{{ ticket.resident_id }}</td>
            <td>{{ formatDate(ticket.created_at) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && tickets.length === 0">
        <p>Нет заявок</p>
      </div>

      <button @click="fetchTickets">Обновить список</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTickets } from '../model/useTickets'

const config = useRuntimeConfig()
const SERVER_URL = config.public.serverUrl

const { tickets, loading, error, fetchTickets } = useTickets(SERVER_URL)

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchTickets()
})
</script>
