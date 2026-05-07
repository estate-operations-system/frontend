<template>
  <div class="users">
    <h1 class="users__title h1">Пользователи</h1>
    <h2 class="users__subtitle h2">Управление жильцами и их профилями</h2>
      
    <EosTable :columns="tableColumns" :rows="tableRows" clickable @rowClick="handleRowClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ApiClient } from '~/api/apiClient'
import type { components } from '~/api/api'
import { EosTable } from 'eos-ui-kit'
import type { TableColumn, TableRow } from 'eos-ui-kit'

type User = components["schemas"]["User"]

const api = new ApiClient('https://backend-pl4x.onrender.com')
const router = useRouter()

const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const tableColumns = computed<TableColumn[]>(() => [
  { id: 'name', name: 'Имя' },
  { id: 'telegram', name: 'Telegram' },
  { id: 'role', name: 'Роль' }
])

const tableRows = computed<TableRow[]>(() =>
  users.value.map(user => ({
    id: String(user.id),
    cells: [
      { id: 'name', data: user.name || '' },
      { id: 'telegram', data: `@${user.telegram_username || '-'}` },
      { id: 'role', data: user.role || 'resident' }
    ]
  }))
)

const handleRowClick = (row: TableRow) => {
  router.push(`/users/${row.id}`)
}

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

<style lang="scss" scoped>
.users {
  &__title {
    color: var(--eos-color-primary-700);
    text-align: center;
  }

  &__subtitle {
    color: var(--eos-color-primary-800);
    text-align: center;
    margin-top: var(--eos-space-xs);
    margin-bottom: var(--eos-space-l);
  }
}
</style>
