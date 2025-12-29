<template>
  <div class="response-display">
    <h3>Ответ сервера:</h3>
    <div class="response-content">
      <pre>{{ response }}</pre>
    </div>
    
    <div class="status" :class="statusClass">
      Статус: {{ status }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  response: string
  status: string
}

const props = defineProps<Props>()

const statusClass = computed(() => {
  if (props.status.includes('Успех')) return 'status-success'
  if (props.status.includes('Ошибка')) return 'status-error'
  return 'status-pending'
})
</script>