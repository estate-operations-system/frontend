<template>
<div>тикеты</div>
</template>

<script setup lang="ts">
import { ApiClient } from '@/api/apiClient'

const api = new ApiClient('https://backend-pl4x.onrender.com')

async function fetchTickets() {
  const usersData = await api.getTickets()
  console.log('Users:', usersData.data)
  console.log('Count:', usersData.count)
}

const x = await fetchTickets()
console.log(x)
</script>
