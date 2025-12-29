<template>
  <div>
    <h1>Тестирование API пользователей</h1>
    
    <button @click="checkServer">Проверить сервер</button>
    
    <h3>Ответ сервера:</h3>
    <pre>{{ response }}</pre>
    
    <p>Статус: {{ status }}</p>
  </div>
</template>

<script setup>
const BASE_URL = 'http://localhost:4000'

const response = ref('')
const status = ref('')

const checkServer = async () => {
  try {
    status.value = 'Запрос отправляется...'
    const res = await fetch(BASE_URL)
    const data = await res.text()
    response.value = data
    status.value = `Успех: статус ${res.status}`
  } catch (error) {
    status.value = `Ошибка: ${error.message}`
    response.value = error.toString()
  }
}
</script>