<template>
  <div>
    <h1>Тестирование API пользователей</h1>
    
    <button @click="checkServer">Проверить сервер</button>
    <button @click="getAllUsers">Получить всех пользователей</button>

    <input v-model="newUser.name" placeholder="Имя" />
    <input v-model="newUser.email" placeholder="Email" type="email" />
    <input v-model="newUser.age" placeholder="Возраст" type="number" />
    <button @click="createUser">Создать</button>

    <h3>Работа с конкретным пользователем (ID):</h3>
    <input v-model="userId" placeholder="Введите ID" type="number" />
    <button @click="getUserById">Получить по ID</button>
    <button @click="updateUser">Обновить</button>
    <button @click="deleteUser">Удалить</button>
    
    <div v-if="userId">
      <h4>Данные для обновления:</h4>
      <input v-model="updateData.name" placeholder="Новое имя" />
      <input v-model="updateData.email" placeholder="Новый email" type="email" />
      <input v-model="updateData.age" placeholder="Новый возраст" type="number" />
    </div>
    <h3>Ответ сервера:</h3>
    <pre>{{ response }}</pre>
    
    <p>Статус: {{ status }}</p>
  </div>
</template>

<script setup lang="ts">
const BASE_URL = 'http://localhost:4000'

const userId = ref('')
const newUser = ref({
  name: '',
  email: '',
  age: ''
})
const updateData = ref({
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

const getUserById = async () => {
  if (!userId.value) {
    status.value = 'Введите ID пользователя'
    return
  }
  
  try {
    status.value = `Получаем пользователя с ID ${userId.value}...`
    const res = await fetch(`${BASE_URL}/api/users/${userId.value}`)
    const data = await res.json()
    response.value = JSON.stringify(data, null, 2)
    status.value = `Успех, статус: ${res.status}`
    
    if (data) {
      updateData.value = { ...data }
    }
  } catch (error) {
    status.value = `Ошибка: ${(error as Error).message}`
    response.value = (error as Error).toString()
  }
}

const updateUser = async () => {
  if (!userId.value) {
    status.value = 'Введите ID пользователя для обновления'
    return
  }
  
  try {
    status.value = `Обновляем пользователя с ID ${userId.value}...`
    const res = await fetch(`${BASE_URL}/api/users/${userId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData.value)
    })
    const data = await res.json()
    response.value = JSON.stringify(data, null, 2)
    status.value = `Успех, статус: ${res.status}`
  } catch (error) {
    status.value = `Ошибка: ${(error as Error).message}`
    response.value = (error as Error).toString()
  }
}

const deleteUser = async () => {
  if (!userId.value) {
    status.value = 'Введите ID пользователя для удаления'
    return
  }
  
  try {
    status.value = `Удаляем пользователя с ID ${userId.value}...`
    const res = await fetch(`${BASE_URL}/api/users/${userId.value}`, {
      method: 'DELETE'
    })
    const data = await res.json()
    response.value = JSON.stringify(data, null, 2)
    status.value = `Успех, статус: ${res.status}`
    
    userId.value = ''
    updateData.value = { name: '', email: '', age: '' }
  } catch (error) {
    status.value = `Ошибка: ${(error as Error).message}`
    response.value = (error as Error).toString()
  }
}
</script>