<template>
  <div class="tickets-container">
    <div class="header">
      <Breadcrumb :items="[
        { label: 'Главная', to: '/' },
        { label: 'Заявки' }
      ]" />

      <h1 class="page-title">Заявки</h1>
      <p class="page-subtitle">Управление заявками от жильцов</p>
    </div>

    <Spinner v-if="loading" label="Загрузка заявок..." />

    <Alert v-else-if="error" type="error" title="Ошибка загрузки" closeable @close="error = null">
      {{ error }}
    </Alert>

    <Card v-else-if="tickets.length > 0">
      <template #header>
        <div class="table-header">
          <h2>Список заявок ({{ tickets.length }})</h2>
        </div>
      </template>

      <table class="tickets-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Категория</th>
            <th>Статус</th>
            <th>Адрес</th>
            <th>ID жильца</th>
            <th>Дата</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in tickets" :key="ticket.id" class="table-row">
            <td class="cell-id">{{ ticket.id }}</td>
            <td class="cell-category">{{ ticket.category }}</td>
            <td class="cell-status">
              <Badge :variant="getBadgeVariant(ticket.status)">
                {{ ticket.status }}
              </Badge>
            </td>
            <td class="cell-address" :title="ticket.address">{{ ticket.address }}</td>
            <td class="cell-resident">{{ ticket.resident_id }}</td>
            <td class="cell-date">{{ formatDate(ticket.created_at) }}</td>
            <td class="cell-action">
              <NuxtLink :to="`/tickets/${ticket.id}`">
                <Button size="sm">Просмотр</Button>
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </Card>

    <Alert v-else type="info" title="Нет данных">
      Заявок не найдено
    </Alert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiClient } from '~/api/apiClient'
import type { components } from '~/api/api'

type Ticket = components["schemas"]["Ticket"]

const api = new ApiClient('https://backend-pl4x.onrender.com')

const tickets = ref<Ticket[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getBadgeVariant = (status: string | undefined): 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' => {
  const statusMap: Record<string, 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'> = {
    'open': 'info',
    'in_progress': 'warning',
    'resolved': 'success',
    'closed': 'secondary'
  }
  return statusMap[status?.toLowerCase() as string] || 'primary'
}

onMounted(async () => {
  try {
    const res = await api.getTickets()
    tickets.value = res.data ?? []
  } catch (e: any) {
    error.value = e.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.tickets-container {
  max-width: 1400px;
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

.tickets-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--eos-font-size-m);
}

.tickets-table thead {
  background-color: var(--eos-color-bg-tertiary);
  border-bottom: 2px solid var(--eos-color-border);
}

.tickets-table th {
  padding: var(--eos-space-m);
  text-align: left;
  font-weight: var(--eos-font-weight-semibold);
  color: var(--eos-color-text);
  user-select: none;
  white-space: nowrap;
}

.tickets-table tbody tr {
  border-bottom: 1px solid var(--eos-color-border);
  transition: background-color var(--eos-transition-fast);
}

.tickets-table tbody tr:hover {
  background-color: var(--eos-color-bg-secondary);
}

.tickets-table td {
  padding: var(--eos-space-m);
  color: var(--eos-color-text);
}

.cell-id {
  font-weight: var(--eos-font-weight-medium);
  color: var(--eos-color-primary);
}

.cell-category {
  color: var(--eos-color-text-secondary);
}

.cell-address {
  color: var(--eos-color-text-secondary);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-resident {
  color: var(--eos-color-text-secondary);
}

.cell-date {
  color: var(--eos-color-text-tertiary);
  font-size: var(--eos-font-size-s);
}

.cell-action a {
  text-decoration: none;
}

@media (max-width: 1024px) {
  .tickets-table {
    font-size: var(--eos-font-size-s);
  }

  .tickets-table th,
  .tickets-table td {
    padding: var(--eos-space-s);
  }

  .cell-address {
    max-width: 100px;
  }
}

@media (max-width: 768px) {
  .tickets-container {
    padding: 0;
  }

  .page-title {
    font-size: var(--eos-font-size-xl);
  }

  .tickets-table {
    font-size: var(--eos-font-size-xs);
  }

  .tickets-table th,
  .tickets-table td {
    padding: var(--eos-space-xs);
  }

  .cell-address {
    max-width: 80px;
  }
}
</style>
