<template>
  <div class="server-controls">
    <button @click="$emit('check-server')">
      Проверить сервер
    </button>
    <button @click="$emit('get-all-users')">
      Получить всех пользователей
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  'check-server': []
  'get-all-users': []
}>()
</script>