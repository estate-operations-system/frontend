<template>
  <div v-if="user" class="user">
    <div class="user__header" :style="{ backgroundColor: headerBgColor }">
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
          <span>
            {{ user.role || 'Жилец' }}
          </span>
        </div>
    </div>

    <section class="user__info">
      <h2 class="user__info-title h2">Информация о пользователе:</h2>
      <div v-if="user.telegram_username" class="p1" style="display: inline-block;">
        Телеграм: 
        <EosButton :variant="ButtonVariant.Tertiary" @click="openTelegram">
          @{{ user.telegram_username }}
        </EosButton>
      </div>
      <div v-if="user.email" class="p1">Почта: {{ user.email }}</div>
      <div v-if="user.phoneNumber" class="p1">Телефон: {{ user.phoneNumber }}</div>
      <div v-if="user.address" class="p1">Адрес: {{ user.address }}</div>
    </section>

    <section v-if="isAdmin" class="user__role-management">
      <h2 class="user__role-management-title h2">Управление ролью</h2>
      <p class="p1">Текущая роль: {{ user.role || 'Жилец' }}</p>
      <select v-model="selectedRole">
        <option value="жилец">жилец</option>
        <option value="юрист">юрист</option>
        <option value="администратор">администратор</option>
      </select>
      <EosButton 
        @click="updateRole"
      >
        Сохранить
      </EosButton>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ApiClient } from '~/api/apiClient'
import { useAuth } from '~/composables/useAuth'
import { EosButton, ButtonVariant } from 'eos-ui-kit'
import type { components } from '~/api/api'

type User = components["schemas"]["User"]

const api = new ApiClient('https://backend-pl4x.onrender.com')
const route = useRoute()
const { user: authUser } = useAuth()
const { getUserRole } = useAuth()

const user = ref<User | null>(null)
const loading = ref(true)
const selectedRole = ref('resident')
const updatingRole = ref(false)

const isAdmin = computed(() => {
  const role = getUserRole()
  return role === 'администратор'
})

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
    console.log('Loading user:', id, 'authUser:', authUser?.value)
    const res = await api.getUserById(id)
    console.log('User loaded:', res.data)
    user.value = res.data ?? null
    if (user.value) {
      selectedRole.value = user.value.role || 'жилец'
    }
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.user {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--eos-space-l) var(--eos-space-m);
  display: flex;
  flex-direction: column;
  gap: var(--eos-space-l);

  &__header {
    display: flex;
    align-items: center;
    color: var(--eos-color-primary-800);
    padding: var(--eos-space-l);
    border-radius: var(--eos-radius-l);
    gap: var(--eos-space-l);

    &-info {
      display: flex;
      flex-direction: column;
      gap: var(--eos-space-xs);
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

  &__info {
    background: var(--eos-color-primary-50);
    border-radius: var(--eos-radius-l);
    overflow: hidden;
    padding: var(--eos-space-l);

    &-title {
      margin-bottom: var(--eos-space-xs);
    }
  }

  &__role-management {
    background: var(--eos-color-primary-50);
    border-radius: var(--eos-radius-l);
    overflow: hidden;
    padding: var(--eos-space-l);
    display: flex;
    flex-direction: column;
    gap: var(--eos-space-s);

    &-title {
      margin-bottom: var(--eos-space-xs);
    }

    .button,
    select {
      width: fit-content;
    }
  }
}
</style>
