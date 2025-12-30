<template>
  <div class="container">
    <h1>Тестирование API пользователей</h1>
    
    <ServerControls 
      @check-server="handleCheckServer"
      @get-all-users="handleGetAllUsers"
    />

    <UserForm v-model:user="newUser" title="Создать пользователя">
      <template #default="{ user }">
        <button 
          @click="handleCreateUser(user)" 
          :disabled="!isValidUser(user)"
          class="create-btn"
        >
          Создать
        </button>
      </template>
    </UserForm>

    <UserOperations 
      v-model:userId="userId"
      @get-user="handleGetUserById"
      @update-user="handleUpdateUser"
      @delete-user="handleDeleteUser"
    />
    
    <UserForm 
      v-if="userId" 
      v-model:user="updateData" 
      title="Данные для обновления:"
    />
    
    <ResponseDisplay 
      :response="response"
      :status="status"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ServerControls from '../components/ServerControls.vue'
import UserForm from '../components/UserForm.vue'
import UserOperations from '../components/UserOperations.vue'
import ResponseDisplay from '../components/ResponseDisplay.vue'
import { useUserApi } from '../composables/useUserApi'
import type { User } from '../types/user'

const { 
  checkServer, 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} = useUserApi()

const userId = ref('')
const newUser = ref<User>({
  name: '',
  email: '',
  age: 0
})
const updateData = ref<User>({
  name: '',
  email: '',
  age: 0
})

const response = ref('')
const status = ref('')

const isValidUser = (user: User): boolean => {
  return !!user.name.trim() && 
         !!user.email.trim() && 
         user.age > 0
}

const handleApiResponse = <T>(
  promise: Promise<{ data?: T; error?: string; status: number }>,
  successMessage: string
) => {
  status.value = 'Выполняется запрос...'
  
  promise.then(({ data, error, status: responseStatus }) => {
    if (error) {
      status.value = `Ошибка: ${error}`
      response.value = JSON.stringify({ error }, null, 2)
    } else {
      status.value = `${successMessage} (статус: ${responseStatus})`
      response.value = JSON.stringify(data, null, 2)
    }
  }).catch((error) => {
    status.value = `Неожиданная ошибка: ${error.message}`
    response.value = error.toString()
  })
}

const handleCheckServer = () => {
  handleApiResponse(checkServer(), 'Сервер доступен')
}

const handleGetAllUsers = () => {
  handleApiResponse(getAllUsers(), 'Пользователи получены')
}

const handleCreateUser = (user: User) => {
  handleApiResponse(createUser(user), 'Пользователь создан')
  
  newUser.value = { name: '', email: '', age: 0 }
}

const handleGetUserById = (id: string) => {
  handleApiResponse(getUserById(id), 'Пользователь получен')
}

const handleUpdateUser = (id: string) => {
  if (!isValidUser(updateData.value)) {
    status.value = 'Заполните все поля для обновления'
    return
  }
  
  handleApiResponse(updateUser(id, updateData.value), 'Пользователь обновлен')
}

const handleDeleteUser = (id: string) => {
  handleApiResponse(deleteUser(id), 'Пользователь удален')
  
  userId.value = ''
  updateData.value = { name: '', email: '', age: 0 }
}
</script>