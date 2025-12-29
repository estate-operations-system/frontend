<template>
  <div>
    <h1>Тестирование API пользователей</h1>
    
    <button @click="checkServer">Проверить сервер</button>
    <button @click="getAllUsers">Получить всех пользователей</button>

    <input v-model="newUser.name" placeholder="Имя" />
    <input v-model="newUser.email" placeholder="Email" type="email" />
    <input v-model="newUser.age" placeholder="Возраст" type="number" />
    <button @click="createUser">Создать</button>
    
    <h3>Ответ сервера:</h3>
    <pre>{{ response }}</pre>
    
    <p>Статус: {{ status }}</p>
  </div>
</template>

<script setup lang="ts">
const BASE_URL = 'http://localhost:4000'

const newUser = ref({
  name: '',
  email: '',
  age: ''
})

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
    status.value = `Ошибка: ${(error as Error).message}`
    response.value = (error as Error).toString()
  }
}

const getAllUsers = async () => {
  try {
    status.value = 'Получаем пользователей...'
    const res = await fetch(`${BASE_URL}/api/users`)
    const data = await res.json()
    response.value = JSON.stringify(data, null, 2)
    status.value = `Успех: статус: ${res.status}`
  } catch (error) {
    status.value = `Ошибка: ${(error as Error).message}`
    response.value = (error as Error).toString()
  }
}

const createUser = async () => {
  try {
    status.value = 'Создаем пользователя...'
    const res = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser.value)
    })
    const data = await res.json()
    response.value = JSON.stringify(data, null, 2)
    status.value = `Успех, статус: ${res.status}`
    
    newUser.value = {
      name: '',
      email: '',
      age: ''
    }
  } catch (error) {
    status.value = `Ошибка: ${(error as Error).message}`
    response.value = (error as Error).toString()
  }
}
</script>