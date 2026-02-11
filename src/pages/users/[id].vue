<template>
  <div>
    <div v-if="loading">Loading...</div>

    <div v-else-if="!user">
      Пользователь не найден
    </div>

    <div v-else>
      <h1>User {{ user.id }}</h1>

      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Telegram ID:</strong> {{ user.telegram_id }}</p>
      <p><strong>Username:</strong> {{ user.telegram_username }}</p>
      <p><strong>Created:</strong> {{ user.created_at }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ApiClient } from '~/api/apiClient'
import type { components } from '~/api/api'

type User = components["schemas"]["User"]

const api = new ApiClient('https://backend-pl4x.onrender.com')
const route = useRoute()

const user = ref<User | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = Number(route.params.id)
  const res = await api.getUserById(id)
  user.value = res.data ?? null
  loading.value = false
})
</script>