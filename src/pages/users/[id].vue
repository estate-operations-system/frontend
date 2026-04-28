<template>
  <div class="user-container">
    <Breadcrumb :items="[
      { label: 'Главная', to: '/' },
      { label: 'Пользователи', to: '/users' },
      { label: `#${$route.params.id}` }
    ]" />

    <Spinner v-if="loading" label="Загрузка профиля пользователя..." />

    <Alert v-else-if="!user" type="error" title="Ошибка">
      Пользователь не найден
    </Alert>

    <div v-else class="user-content">
      <!-- Debug info -->
      <div style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; font-size: 12px; border-radius: 4px;">
        <div>Current user role: {{ authUser?.value?.role }}</div>
        <div>Is Admin: {{ isAdmin }}</div>
      </div>

      <div class="user-header">
        <div>
          <h1 class="user-name">{{ user.name }}</h1>
          <span class="user-id">ID: {{ user.id }}</span>
        </div>
      </div>

      <div class="info-section">
        <h2 class="section-title">Информация о профиле</h2>
        
        <div class="info-grid">
          <div class="info-item">
            <label class="info-label">Telegram ID</label>
            <p class="info-value">{{ user.telegram_id || '-' }}</p>
          </div>

          <div class="info-item">
            <label class="info-label">Telegram Username</label>
            <p class="info-value">@{{ user.telegram_username || '-' }}</p>
          </div>

          <div class="info-item">
            <label class="info-label">Дата создания</label>
            <p class="info-value">{{ formatDate(user.created_at) }}</p>
          </div>

          <div class="info-item" v-if="isAdmin">
            <label class="info-label">Роль</label>
            <div class="role-selector">
              <select v-model="selectedRole" class="role-input">
                <option value="жилец">Жилец</option>
                <option value="юрист">Юрист</option>
                <option value="админ">Администратор</option>
              </select>
              <button 
                @click="updateRole"
                :disabled="selectedRole === (user.role || 'жилец') || updatingRole"
                class="save-button"
              >
                {{ updatingRole ? 'Сохранение...' : 'Сохранить' }}
              </button>
            </div>
          </div>

          <div class="info-item" v-else>
            <label class="info-label">Роль</label>
            <p class="info-value">
              <span :class="'role-badge role-' + (user.role || 'resident')">
                {{ user.role || 'resident' }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <Alert v-if="roleError" type="error" title="Ошибка обновления роли" closeable @close="roleError = null">
        {{ roleError }}
      </Alert>

      <Alert v-if="roleSuccess" type="success" title="Успешно" closeable @close="roleSuccess = false">
        Роль пользователя успешно обновлена
      </Alert>

      <div class="user-actions">
        <NuxtLink to="/users">
          <EosButton variant="secondary">Вернуться к списку</EosButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ApiClient } from '~/api/apiClient'
import { useAuth } from '~/composables/useAuth'
import { EosButton } from 'eos-ui-kit'
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
const roleError = ref<string | null>(null)
const roleSuccess = ref(false)

const isAdmin = computed(() => {
  const role = getUserRole()
  return role === 'администратор'
})
const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const updateRole = async () => {
  if (!user.value) return
  
  updatingRole.value = true
  roleError.value = null
  roleSuccess.value = false
  console.log(selectedRole.value)
  try {
    const res = await api.updateUserRole(user.value.id!, { role: selectedRole.value })
    if (res.data) {
      user.value.role = selectedRole.value
      roleSuccess.value = true
    } else {
      roleError.value = 'Ошибка при обновлении роли'
    }
  } catch (e: any) {
    roleError.value = e.message || 'Ошибка при обновлении роли'
  } finally {
    updatingRole.value = false
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

<style lang="css" scoped>
.user-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--eos-space-l);
}

.user-content {
  background: white;
  border: 1px solid var(--eos-color-border);
  border-radius: var(--eos-radius-m);
  padding: var(--eos-space-2xl);
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--eos-space-2xl);
  padding-bottom: var(--eos-space-l);
  border-bottom: 2px solid var(--eos-color-border);
}

.user-name {
  font-size: var(--eos-font-size-2xl);
  font-weight: var(--eos-font-weight-bold);
  color: var(--eos-color-primary);
  margin: 0 0 var(--eos-space-s) 0;
}

.user-id {
  font-size: var(--eos-font-size-m);
  color: var(--eos-color-text-secondary);
}

.info-section {
  padding: var(--eos-space-l) 0;
}

.section-title {
  font-size: var(--eos-font-size-l);
  font-weight: var(--eos-font-weight-semibold);
  color: var(--eos-color-primary);
  margin: 0 0 var(--eos-space-l) 0;
  padding-bottom: var(--eos-space-m);
  border-bottom: 2px solid var(--eos-color-border);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--eos-space-l);
  margin-bottom: var(--eos-space-2xl);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--eos-space-s);
}

.info-label {
  font-size: var(--eos-font-size-s);
  font-weight: var(--eos-font-weight-semibold);
  color: var(--eos-color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: var(--eos-font-size-m);
  color: var(--eos-color-text);
  word-break: break-all;
  margin: 0;
}

.role-selector {
  display: flex;
  gap: var(--eos-space-s);
  align-items: center;
}

.role-input {
  flex: 1;
  padding: var(--eos-space-s) var(--eos-space-m);
  border: 1px solid var(--eos-color-border);
  border-radius: 4px;
  font-size: var(--eos-font-size-m);
  background-color: white;
  color: var(--eos-color-text);
  cursor: pointer;
}

.role-input:focus {
  outline: none;
  border-color: var(--eos-color-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.save-button {
  padding: var(--eos-space-s) var(--eos-space-m);
  background-color: var(--eos-color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: var(--eos-font-size-m);
  font-weight: var(--eos-font-weight-semibold);
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.save-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: var(--eos-font-size-s);
  font-weight: var(--eos-font-weight-medium);
  text-transform: capitalize;
}

.role-admin {
  background-color: #fee2e2;
  color: #dc2626;
}

.role-manager {
  background-color: #fef3c7;
  color: #d97706;
}

.role-resident {
  background-color: #dbeafe;
  color: #2563eb;
}

.user-actions {
  display: flex;
  gap: var(--eos-space-m);
  border-top: 1px solid var(--eos-color-border);
  padding-top: var(--eos-space-l);
}



@media (max-width: 768px) {
  .user-container {
    padding: var(--eos-space-m);
  }

  .user-content {
    padding: var(--eos-space-l);
  }

  .user-name {
    font-size: var(--eos-font-size-xl);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
