<template>
  <Loader v-if="isLoading" />
  <div v-else class="tickets">
    <PageTitle 
      title="Заявки"
      subtitle="Управление заявками и их статусами"
    >
      <EosButton @click="openCreateModal">Создать заявку</EosButton>
    </PageTitle>

    <div v-if="isCreateModalOpen" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title h3">Создать заявку</h2>
          <EosButton size="small" variant="secondary" @click="closeCreateModal">Закрыть</EosButton>
        </div>

        <form class="create-form" @submit.prevent="submitTicket">
          <EosInput
            v-model="form.category"
            placeholder="Категория"
            required
          />

          <EosInput
            v-model="form.address"
            placeholder="Адрес"
            required
          />

          <EosInput
            v-model="form.description"
            placeholder="Описание проблемы"
            type="textarea"
            required
          />

          <div v-if="createError" class="error-message">{{ createError }}</div>

          <div class="actions">
            <EosButton type="submit" :disabled="creating">
              {{ creating ? 'Создание...' : 'Создать заявку' }}
            </EosButton>
          </div>
        </form>
      </div>
    </div>

    <EosTable :columns="tableColumns" :rows="tableRows" clickable @rowClick="handleRowClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ApiClient } from '~/api/apiClient'
import type { components } from '~/api/api'
import { EosTable, EosButton, EosInput } from 'eos-ui-kit'
import type { TableColumn, TableRow } from 'eos-ui-kit'
import { useAuth } from '~/composables/useAuth'
import PageTitle from '~/components/PageTitle.vue'

type Ticket = components["schemas"]["Ticket"]

const api = new ApiClient('https://backend-pl4x.onrender.com')
const router = useRouter()
const { user, loadCurrentUser } = useAuth()

const tickets = ref<Ticket[]>([])
const isCreateModalOpen = ref(false)
const creating = ref(false)
const createError = ref<string | null>(null)
const isLoading = ref(true);

const form = ref({
  category: '',
  description: '',
  address: '',
  resident_id: undefined as number | undefined
})

const tableColumns = computed<TableColumn[]>(() => [
  { id: 'id', name: 'Номер' },
  { id: 'category', name: 'Категория' },
  { id: 'status', name: 'Статус' },
  { id: 'address', name: 'Адрес' },
  { id: 'resident_id', name: 'ID жильца' },
  { id: 'created_at', name: 'Дата' }
])

const tableRows = computed<TableRow[]>(() =>
  tickets.value.map(ticket => ({
    id: String(ticket.id),
    cells: [
      { id: 'id', data: String(ticket.id) },
      { id: 'category', data: ticket.category || '' },
      { id: 'status', data: ticket.status || '' },
      { id: 'address', data: ticket.address || '' },
      { id: 'resident_id', data: String(ticket.resident_id || '') },
      { id: 'created_at', data: formatDate(ticket.created_at) }
    ]
  }))
)

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

const fetchTickets = async () => {
  try {
    const res = await api.getTickets()
    tickets.value = res.data ?? []
  } catch (e: any) {
    createError.value = e.message || 'Ошибка загрузки'
  } finally {
    isLoading.value = false
  }
}

const handleRowClick = (row: TableRow) => {
  router.push(`/tickets/${row.id}`)
}

const openCreateModal = () => {
  createError.value = null
  form.value.resident_id = user.value?.id
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
}

const submitTicket = async () => {
  createError.value = null

  const resident_id = form.value.resident_id || user.id
  
  if (!form.value.category || !form.value.address || !form.value.description || !resident_id) {
    console.warn('Validation failed:', {
      category: form.value.category,
      address: form.value.address,
      description: form.value.description,
      resident_id,
      user_id: user.value?.id,
      form_resident_id: form.value.resident_id
    })
    createError.value = 'Заполните все поля'
    return
  }

  creating.value = true

  try {
    await api.createTicket({
      category: form.value.category,
      description: form.value.description,
      address: form.value.address,
      resident_id: resident_id,
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

onMounted(async () => {
  await loadCurrentUser()
  await fetchTickets()
})
</script>

<style lang="scss" scoped>
.tickets {
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-l);
  align-items: center;

  &__actions {
    display: flex;
    justify-content: flex-start;
    margin-bottom: var(--eos-spacing-l);
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 50;
  padding: var(--eos-spacing-m);
}

.modal {
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow: auto;
  border-radius: var(--eos-radius-l);
  border: 1px solid var(--eos-color-primary-200);
  background: white;
  padding: var(--eos-spacing-l);
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-m);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--eos-spacing-m);
}

.modal-title {
  font-size: var(--eos-font-size-l);
  font-weight: var(--eos-font-weight-semibold);
  margin: 0;
}

.create-form {
  display: grid;
  gap: var(--eos-spacing-m);
}

.field {
  display: grid;
  gap: var(--eos-spacing-xs);
}

.field label {
  font-size: var(--eos-font-size-s);
  color: var(--eos-color-primary-600);
  font-weight: var(--eos-font-weight-medium);
}

.error-message {
  padding: var(--eos-spacing-m);
  background-color: var(--eos-color-error-light);
  color: var(--eos-color-error);
  border-radius: var(--eos-radius-m);
  font-size: var(--eos-font-size-s);
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>

