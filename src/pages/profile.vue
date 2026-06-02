<template>
  <div class="profile">
    <div
      v-show="isLoading"
      class="profile__loader-overlay"
    >
      <Loader />
    </div>
    <PageTitle
      :title="isLoggedIn ? 'Ваш профиль' : 'Вход в систему'"
      :subtitle="isLoggedIn ? 'Вы успешно авторизованы в системе' : 'Выберите способ авторизации'"
    />

    <EosCard
      v-if="isLoggedIn && user"
      class="profile__card"
    >
      <div class="profile__header">
        <h2
          v-if="!isEditing"
          class="h2"
        >
          {{ user.name }}
        </h2>
        <EosInput
          v-else
          v-model="editForm.name"
          placeholder="Введите имя"
        />

        <button
          v-if="!isEditing"
          class="profile__edit-btn"
          @click="startEdit"
        >
          <EosEditIcon />
        </button>
      </div>

      <div
        v-if="!isEditing"
        class="profile__details"
      >
        <p class="p1">Роль: {{ user.role }}</p>
        <div>
          <span class="p2">Почта:</span>
          <p class="p1">{{ user.email || '-' }}</p>
        </div>
        <div>
          <span class="p2">Телеграм:</span>
          <p class="p1">{{ user.telegram_username ? '@' + user.telegram_username : '-' }}</p>
        </div>
        <div>
          <span class="p2">Телефон:</span>
          <p class="p1">{{ user.phoneNumber || '-' }}</p>
        </div>
        <div>
          <span class="p2">Адрес:</span>
          <p class="p1">{{ user.address || '-' }}</p>
        </div>
      </div>

      <div
        v-else
        class="profile__details"
      >
        <p class="p1">Роль: {{ user.role }}</p>
        <div>
          <span class="p2">Почта:</span>
          <EosInput
            v-model="editForm.email"
            :type="InputType.Email"
            placeholder="example@email.com"
          />
        </div>
        <div>
          <span class="p2">Телеграм:</span>
          <p class="p1">{{ user.telegram_username ? '@' + user.telegram_username : '-' }}</p>
        </div>
        <div>
          <span class="p2">Телефон:</span>
          <EosInput
            v-model="editForm.phoneNumber"
            :type="InputType.Text"
            placeholder="+7 (999) 999-99-99"
          />
        </div>
        <div>
          <span class="p2">Адрес:</span>
          <EosInput
            v-model="editForm.address"
            :type="InputType.Text"
            placeholder="Введите адрес"
          />
        </div>
      </div>

      <div class="profile__actions">
        <template v-if="!isEditing">
          <EosButton
            :loading="isLoading"
            class="profile__action"
            @click="handleLogout"
          >
            Выйти
          </EosButton>
          <EosButton
            :variant="ButtonVariant.Secondary"
            to="/"
            :loading="isLoading"
            class="profile__action"
          >
            На главную
          </EosButton>
        </template>
        <template v-else>
          <EosButton
            :loading="isSaving"
            class="profile__action"
            @click="saveChanges"
          >
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </EosButton>
          <EosButton
            :variant="ButtonVariant.Secondary"
            :loading="isSaving"
            class="profile__action"
            @click="cancelEdit"
          >
            Отменить
          </EosButton>
        </template>
      </div>
    </EosCard>

    <EosCard v-else>
      <div
        v-if="authStatus"
        class="profile__auth-status"
      >
        <p :class="authStatusClass">{{ authStatus }}</p>
      </div>

      <div class="profile__actions">
        <div class="telegram-widget-wrapper">
          <div
            id="telegram-login-widget"
            ref="telegramWidgetRef"
            class="telegram-widget"
          />
        </div>

        <EosButton
          :loading="isLoading"
          class="profile__action"
          @click="loginWithEmail"
        >
          Вход через Email
        </EosButton>

        <EosButton
          :variant="ButtonVariant.Secondary"
          to="/"
          :loading="isLoading"
          class="profile__action"
        >
          На главную
        </EosButton>
      </div>
    </EosCard>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, nextTick } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { ButtonVariant, EosButton, EosCard, EosInput, InputType } from 'eos-ui-kit'
import { ApiClient } from '~/api/apiClient'
import PageTitle from '~/components/PageTitle.vue'
import { EosEditIcon } from 'eos-ui-kit'
import Loader from '~/components/Loader.vue'

const router = useRouter()
const { isLoggedIn, logout, isLoading, user, initializeAuth } = useAuth()
const api = new ApiClient('https://backend-pl4x.onrender.com')

const isEditing = ref(false)
const isSaving = ref(false)
const editError = ref('')
const editSuccess = ref('')
const editForm = ref({
  name: '',
  email: '',
  phoneNumber: '',
  address: ''
})
const isTelegramWidgetLoading = ref(true)

const authStatus = ref('')
const authStatusClass = ref('')
const botUsername = ref('estate_resident_bot')
const telegramWidgetRef = ref<HTMLElement | null>(null)

// Функция для обработки авторизации через Telegram
const handleTelegramAuth = async (user: any) => {
  authStatus.value = 'Отправка данных на сервер...'
  authStatusClass.value = 'profile__status-loading'

  try {
    const response = await fetch('https://backend-pl4x.onrender.com/api/auth/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user),
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`)
    }

    const result = await response.json()

    if (result.token && result.refreshToken) {
      localStorage.setItem('token', result.token)
      localStorage.setItem('refreshToken', result.refreshToken)

      authStatus.value = `Авторизация успешна! Привет, ${user.first_name || 'пользователь'}`
      authStatusClass.value = 'profile__status-success'

      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } else {
      throw new Error('Не получен токен от сервера')
    }
  } catch (error: any) {
    console.error('Auth error:', error)
    authStatus.value = `Ошибка: ${error.message}`
    authStatusClass.value = 'profile__status-error'
  }
}

// Глобальная функция для обратного вызова
;(window as any).onTelegramAuthProfile = handleTelegramAuth

// Альтернативный метод через скрипт (если iframe не работает)
const loadTelegramWidgetScript = () => {
  const container = telegramWidgetRef.value || document.getElementById('telegram-login-widget')
  if (!container) {
    console.error('Container not found')
    return false
  }

  container.innerHTML = ''

  const script = document.createElement('script')
  script.src = 'https://telegram.org/js/telegram-widget.js'
  script.async = true
  script.setAttribute('data-telegram-login', botUsername.value)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-radius', '8')
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-onauth', 'onTelegramAuthProfile(user)')
  script.setAttribute('data-userpic', 'false')

  script.onload = () => {
    const checkIframe = setInterval(() => {
      const iframe = container.querySelector('iframe')

      if (iframe) {
        clearInterval(checkIframe)
        isTelegramWidgetLoading.value = false
      }
    }, 100)
  }

  script.onerror = (error) => {
    console.error('Failed to load Telegram widget script:', error)
    authStatus.value = 'Ошибка загрузки Telegram виджета. Проверьте настройки бота.'
    authStatusClass.value = 'profile__status-error'
    return false
  }

  container.appendChild(script)
  return true
}

const loginWithEmail = () => {
  sessionStorage.setItem('authEmailMode', 'login')
  router.push('/auth')
}

const handleLogout = async () => {
  try {
    await logout()
    // после логаута редирект уже происходит в logout()
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const startEdit = () => {
  if (user.value) {
    editForm.value = {
      name: user.value.name || '',
      email: user.value.email || '',
      phoneNumber: user.value.phoneNumber || '',
      address: user.value.address || ''
    }
    isEditing.value = true
    editError.value = ''
    editSuccess.value = ''
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editError.value = ''
  editSuccess.value = ''
}

const saveChanges = async () => {
  if (!user.value) return

  editError.value = ''
  editSuccess.value = ''
  isSaving.value = true

  try {
    const response = (await api.updateUser(user.value.id!, {
      name: editForm.value.name,
      email: editForm.value.email,
      phoneNumber: editForm.value.phoneNumber,
      address: editForm.value.address
    })) as any

    if (response?.data) {
      user.value.name = editForm.value.name
      user.value.email = editForm.value.email
      user.value.phoneNumber = editForm.value.phoneNumber
      user.value.address = editForm.value.address
      editSuccess.value = 'Изменения сохранены успешно'
      isEditing.value = false

      // Показываем сообщение об успехе на 3 секунды
      setTimeout(() => {
        editSuccess.value = ''
      }, 3000)
    }
  } catch (error: any) {
    console.error('Failed to save changes:', error)
    editError.value = 'Ошибка при сохранении'

    setTimeout(() => {
      editError.value = ''
    }, 3000)
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  // Используем initializeAuth для единообразной загрузки
  await initializeAuth()

  // Загружаем Telegram виджет только если пользователь не авторизован
  if (!isLoggedIn.value) {
    nextTick(() => {
      setTimeout(() => {
        loadTelegramWidgetScript()
      }, 100)
    })
  }
})
</script>

<style lang="scss" scoped>
.profile {
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-l);
  align-items: center;

  &__card {
    text-align: left;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: var(--eos-spacing-m);
    align-items: center;
    min-height: 44px;

    h2 {
      color: var(--eos-color-primary-800);
    }
  }

  &__edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--eos-color-primary-300);
    border-radius: var(--eos-radius-m);
    background-color: transparent;
    cursor: pointer;
    color: var(--eos-color-primary-600);
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background-color: var(--eos-color-primary-50);
      color: var(--eos-color-primary-700);
      border-color: var(--eos-color-primary-400);
    }

    &:active {
      transform: scale(0.95);
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--eos-spacing-m);
    width: min-content;
    margin: 0 auto;
  }

  &__action {
    width: 100%;
  }

  &__auth-status {
    margin-bottom: var(--eos-spacing-m);
    text-align: center;

    p {
      padding: var(--eos-spacing-s);
      border-radius: var(--eos-radius-m);
      margin: 0;
    }
  }

  &__status-loading {
    color: var(--eos-color-info-700);
    background-color: var(--eos-color-info-100);
  }

  &__status-success {
    color: var(--eos-color-success-700);
    background-color: var(--eos-color-success-100);
  }

  &__status-error {
    color: var(--eos-color-danger-700);
    background-color: var(--eos-color-danger-100);
  }

  &__loader-overlay {
    position: fixed;
    inset: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: var(--eos-color-primary-100);

    z-index: 9999;
  }
}

// Добавьте стили для сообщений об ошибке/успехе редактирования
:deep(.profile__card) {
  .edit-success,
  .edit-error {
    margin-top: var(--eos-spacing-m);
    padding: var(--eos-spacing-s);
    border-radius: var(--eos-radius-m);
    text-align: center;
  }

  .edit-success {
    color: var(--eos-color-success-700);
    background-color: var(--eos-color-success-100);
  }

  .edit-error {
    color: var(--eos-color-danger-700);
    background-color: var(--eos-color-danger-100);
  }
}
</style>
