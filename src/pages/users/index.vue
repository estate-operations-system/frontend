<template>
  <div class="users-container">
    <div class="header">
      <Breadcrumb :items="[
        { label: 'Главная', to: '/' },
        { label: 'Пользователи' }
      ]" />
      
      <h1 class="page-title">Пользователи</h1>
      <p class="page-subtitle">Управление жильцами и их профилями</p>
    </div>

    <Spinner v-if="loading" label="Загрузка пользователей..." />
    
    <Alert v-else-if="error" type="error" title="Ошибка загрузки" closeable @close="error = null">
      {{ error }}
    </Alert>

    <Card v-else-if="users.length > 0">
      <template #header>
        <div class="table-header">
          <h2>Список пользователей ({{ users.length }})</h2>
        </div>
      </template>
      
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Telegram</th>
            <th>Роль</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="table-row">
            <td class="cell-id">{{ user.id }}</td>
            <td class="cell-name">{{ user.name }}</td>
            <td class="cell-telegram">@{{ user.telegram_username || '-' }}</td>
            <td class="cell-role">
              <span :class="'role-badge role-' + (user.role || 'resident')">
                {{ user.role || 'resident' }}
              </span>
            </td>
            <td class="cell-action">
              <NuxtLink :to="`/users/${user.id}`">
                <Button size="sm">Просмотр</Button>
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </Card>

    <Alert v-else type="info" title="Нет данных">
      Пользователей не найдено
    </Alert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiClient } from '~/api/apiClient'
import type { components } from '~/api/api'

type User = components["schemas"]["User"]

const api = new ApiClient('https://backend-pl4x.onrender.com')

const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await api.getUsers()
    users.value = res.data ?? []
  } catch (e: any) {
    error.value = e.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})
</script>

<style lang="css" scoped>
.users-container {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  margin-bottom: var(--eos-space-2xl);
}

.page-title {
  font-size: var(--eos-font-size-2xl);
  font-weight: var(--eos-font-weight-bold);
  color: var(--eos-color-primary);
  margin-bottom: var(--eos-space-s);
  margin-top: var(--eos-space-l);
}

.page-subtitle {
  font-size: var(--eos-font-size-m);
  color: var(--eos-color-text-secondary);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-header h2 {
  font-size: var(--eos-font-size-l);
  font-weight: var(--eos-font-weight-semibold);
  margin: 0;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--eos-font-size-m);
}

.users-table thead {
  background-color: var(--eos-color-bg-tertiary);
  border-bottom: 2px solid var(--eos-color-border);
}

.users-table th {
  padding: var(--eos-space-m);
  text-align: left;
  font-weight: var(--eos-font-weight-semibold);
  color: var(--eos-color-text);
  user-select: none;
}

.users-table tbody tr {
  border-bottom: 1px solid var(--eos-color-border);
  transition: background-color var(--eos-transition-fast);
}

.users-table tbody tr:hover {
  background-color: var(--eos-color-bg-secondary);
}

.users-table td {
  padding: var(--eos-space-m);
  color: var(--eos-color-text);
}

.cell-id {
  font-weight: var(--eos-font-weight-medium);
  color: var(--eos-color-primary);
}

.cell-telegram {
  color: var(--eos-color-text-secondary);
  font-family: monospace;
}

.cell-role {
  text-align: center;
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

.cell-action a {
  text-decoration: none;
}

@media (max-width: 768px) {
  .users-container {
    padding: 0;
  }

  .page-title {
    font-size: var(--eos-font-size-xl);
  }

  .users-table {
    font-size: var(--eos-font-size-s);
  }

  .users-table th,
  .users-table td {
    padding: var(--eos-space-s);
  }
}
</style>
