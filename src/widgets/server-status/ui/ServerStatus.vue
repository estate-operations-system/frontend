<template>
  <div>
    <button @click="check">Обновить статус сервера</button>

    <p><strong>Статус:</strong> {{ status }}</p>
    <pre>{{ response }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRuntimeConfig } from '#app'
import { useServerStatus } from '../model/useServerStatus'

const config = useRuntimeConfig()
const SERVER_URL = config.public.serverUrl

const { status, response, check } = useServerStatus(SERVER_URL)

onMounted(() => {
  check()
})
</script>
