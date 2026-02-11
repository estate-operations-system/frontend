<template>
  <div>юзеры</div>
</template>

<script setup lang="ts">
import { ApiClient } from '~/api/apiClient'

const api = new ApiClient('https://backend-pl4x.onrender.com')

async function fetchUsers() {
  const usersData = await api.getUsers()
  console.log('Users:', usersData.data)
  console.log('Count:', usersData.count)
}

const x = await fetchUsers()
console.log(x)            
</script>
