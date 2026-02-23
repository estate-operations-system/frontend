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

    <Card v-else>
      <template #header>
        <div class="card-header-content">
          <div>
            <h1 class="user-name">{{ user.name }}</h1>
            <span class="user-id">ID: {{ user.id }}</span>
          </div>
        </div>
      </template>

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
        </div>
      </div>

      <template #footer>
        <NuxtLink to="/users">
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

type User = components["schemas"]["User"]

const api = new ApiClient('https://backend-pl4x.onrender.com')
const route = useRoute()

const user = ref<User | null>(null)
const loading = ref(true)

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

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const res = await api.getUserById(id)
    user.value = res.data ?? null
  } finally {
    loading.value = false
  }
})
</script>

<style lang="css" scoped>
.user-container {
  max-width: 800px;
  margin: 0 auto;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-name {
  font-size: var(--eos-font-size-xl);
  font-weight: var(--eos-font-weight-bold);
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
  margin-bottom: var(--eos-space-l);
  padding-bottom: var(--eos-space-m);
  border-bottom: 2px solid var(--eos-color-border);
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

@media (max-width: 768px) {
  .user-container {
    padding: 0;
  }

  .user-name {
    font-size: var(--eos-font-size-l);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
