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

    <Card v-else>
      <template #header>
        <div class="card-header-content">
          <div>
            <h1 class="ticket-title">Заявка #{{ ticket.id }}</h1>
            <Badge :variant="getBadgeVariant(ticket.status)">
              {{ ticket.status }}
            </Badge>
          </div>
        </div>
      </template>

      <div class="content-section">
        <div class="section">
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
          </div>
        </div>

        <div class="section" v-if="ticket.address">
          <h2 class="section-title">Адрес</h2>
          <p class="description-text">{{ ticket.address }}</p>
        </div>

        <div class="section" v-if="ticket.description">
          <h2 class="section-title">Описание</h2>
          <p class="description-text">{{ ticket.description }}</p>
        </div>
      </div>

      <template #footer>
        <NuxtLink to="/tickets">
          <Button variant="secondary">Вернуться к списку</Button>
        </NuxtLink>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ApiClient } from '~/api/apiClient'
import type { components } from '~/api/api'

type Ticket = components["schemas"]["Ticket"]

const api = new ApiClient('https://backend-pl4x.onrender.com')
const route = useRoute()

const ticket = ref<Ticket | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

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

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const res = await api.getTicketById(id)
    ticket.value = res.data ?? null
  } catch (e: any) {
    error.value = e.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})
</script>

<style lang="css" scoped>

.ticket-container {
  padding: var(--eos-space-md);
  max-width: 1200px;
  margin: 0 auto;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--eos-space-md);
}

.ticket-title {
  font-size: var(--eos-font-size-2xl);
  font-weight: var(--eos-font-weight-bold);
  color: var(--eos-text);
  margin: 0;
}

.content-section {
  padding: var(--eos-space-md) 0;
  border-bottom: 1px solid var(--eos-border);
}

.content-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: var(--eos-font-size-lg);
  font-weight: var(--eos-font-weight-semibold);
  color: var(--eos-text);
  margin: 0 0 var(--eos-space-md) 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--eos-space-md);
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: var(--eos-font-size-sm);
  font-weight: var(--eos-font-weight-semibold);
  color: var(--eos-text-secondary);
  margin-bottom: var(--eos-space-xs);
}

.info-value {
  font-size: var(--eos-font-size-base);
  color: var(--eos-text);
  word-break: break-word;
}

.info-link {
  color: var(--eos-primary);
  text-decoration: none;
  transition: color var(--eos-transition-base);
}

.info-link:hover {
  color: var(--eos-primary-dark);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .ticket-container {
    padding: var(--eos-space-sm);
  }

  .card-header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .ticket-title {
    font-size: var(--eos-font-size-xl);
  }
}
</style>