<template>
  <div class="tickets-container">
    <div class="title-block">
      <h1 class="page-title">Заявки</h1>
      <Button @click="openCreateModal">Создать заявку</Button>
    </div>

    <div v-if="isCreateModalOpen" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Создать заявку</h2>
          <Button size="sm" variant="secondary" @click="closeCreateModal">Закрыть</Button>
        </div>

        <form class="create-form" @submit.prevent="submitTicket">
          <div class="field-grid">
            <div class="field">
              <label for="category">Категория</label>
              <input id="category" v-model.trim="form.category" type="text" placeholder="Например, Сантехника" required>
            </div>

            <div class="field">
              <label for="resident_id">ID жильца</label>
              <input id="resident_id" v-model.number="form.resident_id" type="number" min="1" required>
            </div>
          </div>

          <div class="field">
            <label for="address">Адрес</label>
            <input id="address" v-model.trim="form.address" type="text" placeholder="ул. Ленина, 10, кв. 25" required>
          </div>

          <div class="field">
            <label for="description">Описание</label>
            <textarea id="description" v-model.trim="form.description" rows="3" placeholder="Опишите проблему" required />
          </div>

          <Alert v-if="createError" type="error" title="Ошибка создания" closeable @close="createError = null">
            {{ createError }}
          </Alert>

          <div class="actions">
            <Button type="submit" :disabled="creating">
              {{ creating ? 'Создание...' : 'Создать заявку' }}
            </Button>
          </div>
        </form>
      </div>
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
const { getUserRole } = useAuth()

const tickets = ref<Ticket[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const isCreateModalOpen = ref(false)
const creating = ref(false)
const createError = ref<string | null>(null)

const isAdmin = computed(() => {
  const role = getUserRole()
  return role === 'администратор'
})
const form = ref({
  category: '',
  description: '',
  address: '',
  resident_id: undefined as number | undefined
})

const fetchTickets = async () => {
  const res = await api.getTickets()
  tickets.value = res.data ?? []
}

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
    await fetchTickets()
  } catch (e: any) {
    error.value = e.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})

const submitTicket = async () => {
  createError.value = null

  if (!form.value.category || !form.value.address || !form.value.description || !form.value.resident_id) {
    createError.value = 'Заполните категорию, адрес, описание и ID жильца'
    return
  }

  creating.value = true

  try {
    await api.createTicket({
      category: form.value.category,
      description: form.value.description,
      address: form.value.address,
      resident_id: form.value.resident_id,
      status: 'open'
    })

    form.value = {
      category: '',
      description: '',
      address: '',
      resident_id: undefined
    }

    await fetchTickets()
    closeCreateModal()
  } catch (e: any) {
    createError.value = e.message || 'Не удалось создать заявку'
  } finally {
    creating.value = false
  }
}

const openCreateModal = () => {
  createError.value = null
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
}
</script>

<style scoped>
.tickets-container {
  max-width: 1400px;
  margin: 0 auto;
}

.title-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--eos-space-m);
  margin-bottom: var(--eos-space-l);
}

.create-form {
  display: grid;
  gap: var(--eos-space-m);
}

.field-grid {
  display: grid;
  gap: var(--eos-space-m);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field {
  display: grid;
  gap: var(--eos-space-xs);
}

.field label {
  font-size: var(--eos-font-size-s);
  color: var(--eos-color-text-secondary);
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid var(--eos-color-border);
  border-radius: var(--eos-radius-m);
  background-color: var(--eos-color-bg-primary);
  color: var(--eos-color-text);
  padding: var(--eos-space-s) var(--eos-space-m);
  font-size: var(--eos-font-size-m);
}

.field textarea {
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 50;
  padding: var(--eos-space-m);
}

.modal {
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow: auto;
  border-radius: var(--eos-radius-l);
  border: 1px solid var(--eos-color-border);
  background: white;
  padding: var(--eos-space-l);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--eos-space-m);
}

.modal-title {
  font-size: var(--eos-font-size-l);
  margin: 0;
}

.page-title {
  font-size: var(--eos-font-size-2xl);
  font-weight: var(--eos-font-weight-bold);
  color: var(--eos-color-primary);
  margin: 0;
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

  .title-block {
    align-items: stretch;
    flex-direction: column;
  }

  .modal {
    padding: var(--eos-space-m);
  }

  .modal-header {
    align-items: stretch;
    flex-direction: column;
    gap: var(--eos-space-s);
  }

  .field-grid {
    grid-template-columns: 1fr;
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
