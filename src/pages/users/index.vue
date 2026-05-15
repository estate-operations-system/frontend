<template>
  <Loader v-if="isLoading" />
  <div v-else class="users">
    <PageTitle 
      :title="'Пользователи'"
      :subtitle="'Управление жильцами и их профилями'"
    />

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
import PageTitle from '~/components/PageTitle.vue'

type User = components["schemas"]["User"]

const api = new ApiClient('https://backend-pl4x.onrender.com')
const router = useRouter()
const isLoading = ref(true);

const users = ref<User[]>([])
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
    isLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
.users {
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-l);
  align-items: center;
}
</style>
