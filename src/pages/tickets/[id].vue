<template>
  <Loader v-if="isLoading"/>
  <div v-else-if="ticket" class="ticket">
    <PageTitle 
      :title="'Заявка #' + ticket.id"
      :subtitle="ticket.category"
    />

    <EosCard class="ticket__info" align="left" size="m">
      <h2 class="ticket__info-title h2">Основная информация</h2>
      <div class="ticket__info-grid">
        <div class="ticket__info-item">
          <span class="p2">Статус</span>
          <p class="p1">{{ ticket.status || '-' }}</p>
        </div>
        <div class="ticket__info-item">
          <span class="p2">Адрес</span>
          <p class="p1">{{ ticket.address || '-' }}</p>
        </div>
        <div class="ticket__info-item">
          <span class="p2">ID жильца</span>
          <EosButton :variant="ButtonVariant.Tertiary" :to="`/users/${ticket.resident_id}`" class="ticket__link">
            {{ ticket.resident_id }}
          </EosButton>
        </div>
        <div class="ticket__info-item">
          <span class="p2">Дата создания</span>
          <p class="p1">{{ formatDate(ticket.created_at) }}</p>
        </div>
      </div>
    </EosCard>

    <EosCard v-if="ticket.description" align="left" size="m">
      <h2 class="h2">Описание</h2>
      <p class="p1">{{ ticket.description }}</p>
    </EosCard>

    <EosCard v-if="isAdmin || ticket.comments" align="left" size="m">
      <EosTabs 
        v-model="activeTab"
        :tabs="tabItems"
      />

      <div v-show="activeTab === 'comments'" class="section-content">
        <div class="add-comment">
          <form @submit.prevent="submitComment">
            <EosInput
              v-model="newComment"
              :type="InputType.Textarea"
              placeholder="Введите ваш комментарий..."
              :disabled="submittingComment"
            />
            <EosButton 
              type="submit" 
              :disabled="submittingComment || !newComment"
            >
              {{ submittingComment ? 'Отправка...' : 'Отправить' }}
            </EosButton>
          </form>
          <div v-if="commentError" class="error-message">{{ commentError }}</div>
        </div>
        
        <div v-if="ticket.comments && ticket.comments.length > 0" class="comments-list">
          <div
            v-for="comment in [...ticket.comments].reverse()"
            :key="comment.id"
            class="comment-item"
            :style="{ backgroundColor: getCommentBackground(comment) }"
          >
            <div class="comment-header">
              <strong>{{ comment.user_name }}</strong>
              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <div class="comment-text">{{ comment.comment }}</div>
          </div>
        </div>
        <div v-else class="no-comments">Комментариев пока нет</div>
      </div>

      <!-- Таб Управление статусом -->
      <div v-if="isAdmin" v-show="activeTab === 'status'" class="section-content">
        <p class="p1">Текущий статус: {{ ticket.status || '-' }}</p>
        
        <div class="ticket__status-controls">
          <EosSelect 
            v-model="selectedStatus"
            :options="statusOptions"
            placeholder="Выберите статус"
          />
          <EosButton @click="updateTicketStatus" :disabled="updatingStatus">
            {{ updatingStatus ? 'Сохранение...' : 'Сохранить' }}
          </EosButton>
        </div>
        
        <div v-if="statusError" class="ticket__error p2 text-error">{{ statusError }}</div>
        <div v-if="statusSuccess" class="ticket__success p2 text-success">Статус успешно обновлен</div>

        <div v-if="ticket.statusHistory" class="status-history">
          <h3 class="h3">История изменений статуса</h3>
          <div class="status-history">
            <div
              v-for="history in [...ticket.statusHistory].reverse()"
              :key="history.id"
              class="history-item"
            >
              <div class="history-content">
                <span class="status-change">
                  {{ history.old_status ? `${history.old_status} → ${history.new_status}` : `Создано со статусом ${history.new_status}` }}
                </span>
                <span v-if="history.changed_by_name" class="changed-by">
                  ({{ history.changed_by_name }})
                </span>
              </div>
              <div class="history-meta">
                <span class="history-date">{{ formatDate(history.changed_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EosCard>

    <div class="ticket__actions">
      <NuxtLink to="/tickets">
        <EosButton variant="secondary">Вернуться к списку</EosButton>
      </NuxtLink>
    </div>
  </div>

  <div v-else-if="!ticket" class="ticket__empty">
    <p class="p1 text-secondary">Заявка не найдена</p>
    <NuxtLink to="/tickets">
      <EosButton variant="secondary">Вернуться к списку</EosButton>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ApiClient } from '~/api/apiClient'
import { useAuth } from '~/composables/useAuth'
import { EosButton, EosSelect, EosInput, InputType, EosTabs, EosCard, ButtonVariant } from 'eos-ui-kit'
import type { SelectOption, TabItem } from 'eos-ui-kit'
import type { components } from '~/api/api'

type Ticket = components["schemas"]["Ticket"]

const api = new ApiClient('https://backend-pl4x.onrender.com')
const route = useRoute()
const { user: authUser } = useAuth()

const ticket = ref<Ticket | null>(null)
const selectedStatus = ref('open')
const updatingStatus = ref(false)
const statusError = ref<string | null>(null)
const statusSuccess = ref(false)
const hasUnreadUpdates = ref(false)
const isLoading = ref(true)

const statusOptions: SelectOption[] = [
  { label: 'В работе', value: 'В работе' },
  { label: 'Выполнена', value: 'Выполнена' }
]

const activeTab = ref<'comments' | 'status'>('comments')

const tabItems = computed<TabItem[]>(() => {
  const items: TabItem[] = [
    { label: 'Комментарии', value: 'comments' }
  ]
  if (isAdmin.value) {
    items.push({ label: 'Управление статусом', value: 'status' })
  }
  return items
})

const usersColorMap = ref<Map<number, string>>(new Map())

const newComment = ref('')
const submittingComment = ref(false)
const commentError = ref('')

const isAdmin = computed(() => {
  const role = authUser.value?.role
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

const updateTicketStatus = async () => {
  if (!ticket.value) return
  
  updatingStatus.value = true
  statusError.value = null
  statusSuccess.value = false
  
  try {
    await api.updateTicketStatus(ticket.value.id, { status: selectedStatus.value })
    ticket.value.status = selectedStatus.value
    statusSuccess.value = true
    setTimeout(() => {
      statusSuccess.value = false
    }, 3000)
  } catch (e: any) {
    statusError.value = e.message || 'Ошибка обновления статуса'
  } finally {
    updatingStatus.value = false
  }
}

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const res = await api.getTicketById(id)
    ticket.value = res.data ?? null
    if (ticket.value) {
      selectedStatus.value = ticket.value.status || 'open'
      // Заполняем карту цветов пользователей из комментариев
      if (ticket.value.comments) {
        for (const comment of ticket.value.comments) {
          if (comment.user_id && comment.user_color) {
            usersColorMap.value.set(comment.user_id, comment.user_color)
          }
        }
      }
      // Добавляем текущего пользователя если это его комментарий
      if (authUser.value && authUser.value.color) {
        usersColorMap.value.set(authUser.value.id, authUser.value.color)
      }
    }
  } catch (e: any) {
    console.error('Error loading ticket:', e)
  } finally {
    isLoading.value = false
  }
})

const adjustColor = (color: string) => {
  const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) return color
  
  const hue = match[1]
  const saturation = Math.max(parseInt(match[2]) - 40, 20)
  const lightness = Math.min(parseInt(match[3]) + 40, 95)
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

const getCommentBackground = (comment: any) => {
  // Если у комментария есть цвет пользователя
  if (comment.user_color) {
    return adjustColor(comment.user_color)
  }
  // Если есть user_id в карте
  if (comment.user_id && usersColorMap.value.has(comment.user_id)) {
    const color = usersColorMap.value.get(comment.user_id)
    return color ? adjustColor(color) : 'white'
  }
  return 'white'
}

const submitComment = async () => {
  if (!newComment.value) return

  try {
    submittingComment.value = true
    commentError.value = ''

    const response = await api.addTicketComment(ticket.value!.id, {
      comment: newComment.value
    })

    if (response?.success) {
      // Добавляем новый комментарий к списку с цветом пользователя
      if (!ticket.value!.comments) ticket.value!.comments = []
      // Если нет user_color в ответе, добавляем цвет текущего пользователя
      const commentWithColor = {
        ...response.data,
        user_color: response.data.user_color || authUser.value?.color
      }
      if (authUser.value?.id && authUser.value?.color) {
        usersColorMap.value.set(authUser.value.id, authUser.value.color)
      }
      ticket.value!.comments.push(commentWithColor)
      newComment.value = ''
    } else {
      commentError.value = response.data?.error || 'Ошибка добавления комментария'
    }
  } finally {
    submittingComment.value = false
  }
}
</script>

<style lang="scss" scoped>
.ticket {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-l);

  &__info {
    &-title {
      color: var(--eos-color-primary-800)
    }

    &-grid {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--eos-spacing-m);
    }

    &-item {
      display: flex;
      flex-direction: column;
      gap: var(--eos-spacing-xs);
    }
  }

  &__status-controls {
    display: flex;
    gap: var(--eos-spacing-m);
    align-items: center;
    flex-wrap: wrap;
  }

  &__error {
    padding: var(--eos-spacing-m);
    background-color: var(--eos-color-error-light);
    border-radius: var(--eos-radius-m);
    margin-top: var(--eos-spacing-m);
  }

  &__success {
    padding: var(--eos-spacing-m);
    background-color: #ecfdf5;
    border-radius: var(--eos-radius-m);
    margin-top: var(--eos-spacing-m);
  }

  &__actions {
    display: flex;
    gap: var(--eos-spacing-m);
  }

  &__empty {
    max-width: 1000px;
    margin: 0 auto;
    padding: var(--eos-spacing-2xl) var(--eos-spacing-m);
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: var(--eos-spacing-l);
    align-items: center;
  }

  &__link {
    justify-content: flex-start;
  }
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-m);
  width: 100%;
}

.status-history {
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-m);
}

.history-item {
  background: white;
  border: 1px solid var(--eos-color-primary-200);
  border-radius: var(--eos-radius-m);
  padding: var(--eos-spacing-m);
  display: flex;
  gap: var(--eos-spacing-m);
  align-items: flex-start;
  justify-content: space-between;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-xs);
  flex: 1;
}

.history-meta {
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-xs);
  align-items: flex-end;
  flex-shrink: 0;
}

.status-change {
  font-size: var(--eos-font-size-m);
  color: var(--eos-color-primary-950);
  font-weight: var(--eos-font-weight-medium);
}

.history-date {
  font-size: var(--eos-font-size-s);
  color: var(--eos-color-primary-500);
}

.changed-by {
  font-size: var(--eos-font-size-s);
  color: var(--eos-color-primary-600);
  font-style: italic;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-m);
}

.comment-item {
  background: white;
  border: 1px solid var(--eos-color-primary-200);
  border-radius: var(--eos-radius-m);
  padding: var(--eos-spacing-m);
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-s);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--eos-spacing-m);
  justify-content: space-between;
  flex-wrap: wrap;

  strong {
    color: var(--eos-color-primary-800);
    font-size: var(--eos-font-size-m);
  }
}

.comment-date {
  font-size: var(--eos-font-size-s);
  color: var(--eos-color-primary-500);
}

.comment-text {
  font-size: var(--eos-font-size-m);
  color: var(--eos-color-primary-950);
  white-space: pre-wrap;
  word-break: break-word;
}

.no-comments {
  padding: var(--eos-spacing-m);
  text-align: center;
  color: var(--eos-color-primary-600);
  font-size: var(--eos-font-size-m);
  background: white;
  border: 1px solid var(--eos-color-primary-200);
  border-radius: var(--eos-radius-m);
}

.add-comment {
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-m);

  h3 {
    font-size: var(--eos-font-size-m);
    font-weight: var(--eos-font-weight-semibold);
    color: var(--eos-color-primary-800);
    margin: 0;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--eos-spacing-m);
  }
}

.error-message {
  padding: var(--eos-spacing-m);
  background-color: var(--eos-color-error-light);
  color: var(--eos-color-error);
  border-radius: var(--eos-radius-m);
  font-size: var(--eos-font-size-s);
}
</style>
