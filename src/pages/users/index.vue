<template>
  <div>
    <h1>Users</h1>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>

    <table v-else>
      <tr v-for="user in users" :key="user.id">
        <td>
          <NuxtLink :to="`/users/${user.id}`">
            {{ user.id }}
          </NuxtLink>
        </td>
        <td>{{ user.name }}</td>
        <td>{{ user.telegram_username }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiClient } from '~/api/apiClient'
import type { components } from '~/api/api'

type User = components["schemas"]["User"]

const api = new ApiClient('https://backend-pl4x.onrender.com')

const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await api.getUsers()
    users.value = res.data ?? []
  } catch (e: any) {
    error.value = e.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})
</script>