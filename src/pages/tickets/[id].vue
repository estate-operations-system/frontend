<template>
  <div class="ticket-container">
    <Breadcrumb :items="[
      { label: 'Главная', to: '/' },
      { label: 'Заявки', to: '/tickets' },
      { label: `#${$route.params.id}` }
    ]" />

    <Spinner v-if="loading" label="Загрузка заявки..." />

    <Alert v-else-if="!ticket" type="error" title="Ошибка">
      Заявка не найдена
    </Alert>

    <div v-else class="ticket-content">
      <div class="ticket-header">
        <div>
          <h1 class="ticket-title">Заявка #{{ ticket.id }}</h1>
          <Badge :variant="getBadgeVariant(ticket.status)">
            {{ ticket.status }}
          </Badge>
        </div>
      </div>

      <div class="ticket-body">
        <div class="info-section">
          <h2 class="section-title">Основная информация</h2>
          
          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">Категория</label>
              <p class="info-value">{{ ticket.category }}</p>
            </div>

            <div class="info-item">
              <label class="info-label">ID жильца</label>
              <p class="info-value">
                <NuxtLink :to="`/users/${ticket.resident_id}`" class="info-link">
                  {{ ticket.resident_id }}
                </NuxtLink>
              </p>
            </div>

            <div class="info-item">
              <label class="info-label">Дата создания</label>
              <p class="info-value">{{ formatDate(ticket.created_at) }}</p>
            </div>

            <div class="info-item" v-if="isAdmin">
              <label class="info-label">Статус</label>
              <div class="status-selector">
                <select v-model="selectedStatus" class="status-input">
                  <option value="Новая">Новая</option>
                  <option value="В работе">В работе</option>
                  <option value="Выполнена">Выполнена</option>
                </select>
                <button 
                  @click="updateTicketStatus"
                  class="save-button"
                >
                  {{ updatingStatus ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section" v-if="ticket.address">
          <h2 class="section-title">Адрес</h2>
          <p class="description-text">{{ ticket.address }}</p>
        </div>

        <div class="info-section" v-if="ticket.description">
          <h2 class="section-title">Описание</h2>
          <p class="description-text">{{ ticket.description }}</p>
        </div>
      </div>

      <Alert v-if="statusError" type="error" title="Ошибка обновления статуса" closeable @close="statusError = null">
        {{ statusError }}
      </Alert>

      <Alert v-if="statusSuccess" type="success" title="Успешно" closeable @close="statusSuccess = false">
        Статус заявки успешно обновлен
      </Alert>

      <div class="ticket-actions">
        <NuxtLink to="/tickets">
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

type Ticket = components["schemas"]["Ticket"]

const api = new ApiClient('https://backend-pl4x.onrender.com')
const route = useRoute()
const { getUserRole } = useAuth()

const ticket = ref<Ticket | null>(null)
const loading = ref(true)
const selectedStatus = ref('open')
const updatingStatus = ref(false)
const statusError = ref<string | null>(null)
const statusSuccess = ref(false)

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

const getBadgeVariant = (status: string | undefined): 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' => {
  const statusMap: Record<string, 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'> = {
    'open': 'info',
    'in_progress': 'warning',
    'resolved': 'success',
    'closed': 'secondary'
  }
  return statusMap[status?.toLowerCase() as string] || 'primary'
}

const updateTicketStatus = async () => {
  console.log(status)
  try {
    await api.updateTicketStatus(ticket.value.id, { status })
    const ticket = tickets.value.find(t => t.id === id)
    if (ticket) {
      ticket.status = status
    }
  } catch (e: any) {
    error.value = e.message || 'Ошибка обновления статуса'
  }
}

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const res = await api.getTicketById(id)
    ticket.value = res.data ?? null
    if (ticket.value) {
      selectedStatus.value = ticket.value.status || 'Новая'
    }
  } catch (e: any) {
    statusError.value = e.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})
</script>

<style lang="css" scoped>
.ticket-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--eos-space-l);
}

.ticket-content {
  background: white;
  border: 1px solid var(--eos-color-border);
  border-radius: var(--eos-radius-m);
  padding: var(--eos-space-2xl);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--eos-space-2xl);
  padding-bottom: var(--eos-space-l);
  border-bottom: 2px solid var(--eos-color-border);
}

.ticket-title {
  font-size: var(--eos-font-size-2xl);
  font-weight: var(--eos-font-weight-bold);
  color: var(--eos-color-primary);
  margin: 0 0 var(--eos-space-s) 0;
}

.ticket-body {
  padding: 0;
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

.description-text {
  font-size: var(--eos-font-size-m);
  color: var(--eos-color-text);
  line-height: 1.6;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--eos-space-l);
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

.status-selector {
  display: flex;
  gap: var(--eos-space-s);
  align-items: center;
}

.status-input {
  flex: 1;
  padding: var(--eos-space-s) var(--eos-space-m);
  border: 1px solid var(--eos-color-border);
  border-radius: 4px;
  font-size: var(--eos-font-size-m);
  background-color: white;
  color: var(--eos-color-text);
  cursor: pointer;
}

.status-input:focus {
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

.info-link {
  color: var(--eos-color-primary);
  text-decoration: none;
  transition: color var(--eos-transition-base);
}

.info-link:hover {
  color: var(--eos-color-primary-dark, #1e40af);
  text-decoration: underline;
}

.ticket-actions {
  display: flex;
  gap: var(--eos-space-m);
  border-top: 1px solid var(--eos-color-border);
  padding-top: var(--eos-space-l);
  margin-top: var(--eos-space-2xl);
}

@media (max-width: 768px) {
  .ticket-container {
    padding: var(--eos-space-m);
  }

  .ticket-content {
    padding: var(--eos-space-l);
  }

  .ticket-title {
    font-size: var(--eos-font-size-xl);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
