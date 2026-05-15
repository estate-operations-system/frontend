<template>
  <Loader v-if="!user" />
  <div v-if="user" class="user">
    <EosCard class="user__header" align="left" size="m" :style="{ backgroundColor: headerBgColor }">
        <div class="user__avatar">
          <div v-if="user.avatar">
            <!-- TODO: добавить поддержку загрузки аватаров -->
          </div>
          <div v-else class="user__avatar-placeholder h1" :style="{ backgroundColor: user.color || '#ad6952' }">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
        </div>
        <div class="user__header-info">
          <h1 class="h1">{{ user.name }}</h1>
          <!-- TODO: добавить тег для роли пользователя -->
          <span class="p1">
            {{ user.role }}
          </span>
        </div>
    </EosCard>

    <EosCard  size="m" align="left">
      <h2 class="user__title h2">Информация о пользователе:</h2>
      <div class="user__contacts">
        <div v-if="user.telegram_username" class="p1" style="display: inline-block;">
          Телеграм: 
          <EosButton :variant="ButtonVariant.Tertiary" @click="openTelegram">
            @{{ user.telegram_username }}
          </EosButton>
        </div>
        <div v-if="user.email" class="p1">Почта: {{ user.email }}</div>
        <div v-if="user.phoneNumber" class="p1">Телефон: {{ user.phoneNumber }}</div>
        <div v-if="user.address" class="p1">Адрес: {{ user.address }}</div>
      </div>
    </EosCard>

    <EosCard v-if="currentUser.role === 'администратор'"  size="m" align="left">
      <h2 class="user__role-management-title h2">Управление ролью</h2>
      <p class="p1">Текущая роль: {{ user.role || 'Жилец' }}</p>
      <div class="user__actions">
        <EosSelect 
          v-model="selectedRole"
          :options="roleOptions"
        />
        <EosButton 
          @click="updateRole"
        >
          Сохранить
        </EosButton>
      </div>
    </EosCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ApiClient } from '~/api/apiClient'
import { useAuth } from '~/composables/useAuth'
import { EosButton, EosSelect, EosCard, ButtonVariant } from 'eos-ui-kit'
import type { components } from '~/api/api'
import Loader from '~/components/Loader.vue'

type User = components["schemas"]["User"]

const api = new ApiClient('https://backend-pl4x.onrender.com')
const route = useRoute()

const { user: currentUser, loadCurrentUser } = useAuth()
const user = ref<User | null>(null)
const loading = ref(true)
const selectedRole = ref('resident')
const updatingRole = ref(false)

const roleOptions = computed(() => [
  { label: 'жилец', value: 'жилец' },
  { label: 'юрист', value: 'юрист' },
  { label: 'администратор', value: 'администратор' }
])

const headerBgColor = computed(() => {
  const color = user.value?.color || '#ad6952'
  const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) return color
  
  const hue = match[1]
  const saturation = Math.max(parseInt(match[2]) - 30, 30)
  const lightness = Math.min(parseInt(match[3]) + 37, 95)
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
})

const updateRole = async () => {
  if (!user.value) return
  
  updatingRole.value = true
  const oldRole = user.value.role || 'жилец'
  try {
    const res = await api.updateUserRole(user.value.id!, { role: selectedRole.value })
    if (res.data) {
      user.value.role = selectedRole.value
      alert(`Роль пользователя "${user.value.name}" изменена\n\n${oldRole} → ${selectedRole.value}`)
    } else {
      alert('Ошибка при обновлении роли')
    }
  } catch (e: any) {
    alert(e.message || 'Ошибка при обновлении роли')
  } finally {
    updatingRole.value = false
  }
}

const openTelegram = () => {
  if (user.value?.telegram_username) {
    window.open(`https://t.me/${user.value.telegram_username}`, '_blank')
  }
}

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const res = await api.getUserById(id)
    user.value = res.data ?? null
    if (user.value) {
      selectedRole.value = user.value.role || 'жилец'
    }
  } finally {
    loading.value = false
  }
  loadCurrentUser()
  console.log(currentUser)
})
</script>

<style lang="scss" scoped>
.user {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-l);

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: var(--eos-color-primary-800);

    &-info {
      display: flex;
      flex-direction: column;
      gap: var(--eos-spacing-xs);
    }
  }

  &__avatar {
    &-placeholder {
      width: 64px;
      height: 64px;
      border-radius: var(--eos-radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.5);
      color: white;
    }
  }

  &__title {
    color: var(--eos-color-primary-700);
  }

  &__contacts {
    display: flex;
    flex-direction: column;
    gap: var(--eos-spacing-s);
  }

  &__actions {
    display: flex;
    gap: var(--eos-spacing-s); 
    width: min-content;
  }
}
</style>
