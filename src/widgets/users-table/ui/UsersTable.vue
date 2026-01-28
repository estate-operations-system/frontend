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

    <button @click="fetchUsers">Обновить список</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUsers } from '../model/useUsers'

const config = useRuntimeConfig()
const SERVER_URL = config.public.serverUrl

const { users, loading, error, fetchUsers } = useUsers(SERVER_URL)

onMounted(() => {
  fetchUsers()
})
</script>
