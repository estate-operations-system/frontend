<template>
  <div style="padding: 20px;">
    <h1>Заявки</h1>
    
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const tickets = ref([])
const loading = ref(false)
const error = ref(null)

const loadTickets = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('http://localhost:4000/api/tickets')
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Получены данные:', data)
    
    if (Array.isArray(data)) {
      tickets.value = data
    } else if (data.tickets && Array.isArray(data.tickets)) {
      tickets.value = data.tickets
    } else if (data.success && Array.isArray(data.data)) {
      tickets.value = data.data
    } else {
      tickets.value = []
    }
    
  } catch (err) {
    console.error('Ошибка:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
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
  loadTickets()
})
</script>
