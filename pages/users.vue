<template>
  <div>
    <h1>Пользователи</h1>
    
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">{{ error }}</div>
    
    <div v-else>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Возраст</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.age }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/users')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    

    if (data.success && data.users) {
      return data.users
    } else if (Array.isArray(data)) {
      return data
    } else if (data.data && Array.isArray(data.data)) {
      return data.data
    } else {
      throw new Error('Неверный формат данных')
    }
  } catch (error) {
    console.error('Ошибка загрузки:', error)
    throw error
  }
}

const users = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    users.value = await fetchUsers()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>