<template>
  <div>
    <h1>Тестирование API пользователей</h1>
    
    <button @click="checkServer">Проверить сервер</button>
    <button @click="getAllUsers">Получить всех пользователей</button>

    <UserForm v-model:user="newUser" title="Создать пользователя">
      <button @click="createUser">Создать</button>
    </UserForm>

    <UserOperations 
      v-model:userId="userId"
      @get-user="getUserById"
      @update-user="updateUser"
      @delete-user="deleteUser"
    />
    
    <UserForm 
      v-if="userId" 
      v-model:user="updateData" 
      title="Данные для обновления:"
    />
    
    <h3>Ответ сервера:</h3>
    <pre>{{ response }}</pre>
    
    <p>Статус: {{ status }}</p>
  </div>
</template>

<script setup lang="ts">
import UserForm from '../components/UserForm.vue'
import UserOperations from '../components/UserOperations.vue'

const BASE_URL = 'http://localhost:4000'

const userId = ref('')
const newUser = ref({
  name: '',
  email: '',
  age: 0
})
const updateData = ref({
  name: '',
  email: '',
  age: 0
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
      age: 0
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
    updateData.value = {
      name: '',
      email: '',
      age: 0
    }
  } catch (error) {
    status.value = `Ошибка: ${(error as Error).message}`
    response.value = (error as Error).toString()
  }
}
</script>