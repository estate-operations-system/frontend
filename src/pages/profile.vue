<template>
  <div class="profile">
      <template v-if="isLoggedIn">
        <h1 class="profile__title">Ваш профиль</h1>
        <p class="profile__subtitle">Вы успешно авторизованы в системе</p>

        <!-- <div>
          Информация о пользователе будет отображаться здесь в будущем. Сейчас это просто заглушка для демонстрации авторизации.
        </div> -->
        
        <div class="profile__actions">
          <EosButton @click="handleLogout" :loading="isLoading">
            Выйти
          </EosButton>
          <EosButton :variant="ButtonVariant.Secondary" to="/" :loading="isLoading">
            На главную
          </EosButton>
        </div>
      </template>

      <!-- <div v-else class="auth-content">
        <div class="auth-header">
          <h1>Вход в систему</h1>
          <p>Выберите способ авторизации</p>
        </div>
        
        <div class="auth-methods-container">
          <div class="telegram-section">
            <div class="telegram-widget-container">
              <div 
                id="telegram-login-widget"
                class="telegram-widget"
              ></div>
            </div>
            <p v-if="authStatus" :class="authStatusClass">{{ authStatus }}</p>
          </div>

          <div class="email-section">
            <button @click="loginWithEmail" class="auth-method-button email">
              <span class="auth-method-text">Вход через Email</span>
            </button>
          </div>
        </div>
        
        <button @click="goHome" class="back-button">Вернуться на главную</button>
      </div> -->
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onMounted, nextTick } from "vue";
import { useAuth } from "~/composables/useAuth";
import { ButtonVariant, EosButton } from "eos-ui-kit";

const router = useRouter();
const config = useRuntimeConfig();
const { isLoggedIn, logout, isLoading } = useAuth();

const authStatus = ref('');
const authStatusClass = ref('');
const botUsername = ref(config.public.telegramBotUsername || 'your_bot_username');

(window as any).onTelegramAuthProfile = async (user: any) => {
  console.log('Telegram auth callback received:', user);
  authStatus.value = 'Отправка данных на сервер...';
  authStatusClass.value = 'loading';
  
  try {
    const response = await fetch('https://backend-pl4x.onrender.com/api/auth/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    const result = await response.json();
    console.log('Auth result:', result);

    if (result.token && result.refreshToken) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('refreshToken', result.refreshToken);
      
      authStatus.value = `Авторизация успешна! Привет, ${user.first_name || 'пользователь'}`;
      authStatusClass.value = 'success';

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else {
      throw new Error('Не получен токен от сервера');
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    authStatus.value = `Ошибка: ${error.message}`;
    authStatusClass.value = 'error';
  }
};

const loadTelegramWidget = () => {
  const container = document.getElementById('telegram-login-widget');
  if (!container) {
    console.error('Container not found');
    return;
  }
  
  container.innerHTML = '';
  
  const script = document.createElement('script');
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.async = true;
  script.setAttribute('data-telegram-login', botUsername.value);
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-radius', '8');
  script.setAttribute('data-request-access', 'write');
  script.setAttribute('data-onauth', 'onTelegramAuthProfile(user)');
  script.setAttribute('data-userpic', 'true');
  
  script.onload = () => {
    console.log('Telegram widget script loaded and rendered');
  };
  
  script.onerror = (error) => {
    console.error('Failed to load Telegram widget:', error);
    authStatus.value = 'Ошибка загрузки Telegram виджета. Проверьте настройки бота.';
    authStatusClass.value = 'error';
  };
  
  container.appendChild(script);
};

const loginWithEmail = () => {
  router.push('/auth?method=email');
};

const goHome = () => {
  router.push('/');
};

const handleLogout = async () => {
  try {
    await logout();
    window.location.reload();
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

onMounted(() => {
  if (!isLoggedIn.value) {
    nextTick(() => {
      loadTelegramWidget();
    });
  }
});
</script>

<style lang="scss" scoped>
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--eos-space-l) var(--eos-space-m);
  background-color: var(--eos-color-primary-50);
  width: 100%;
  height: 100%;
  border-radius: var(--eos-radius-l);

  &__title {
    font-size: var(--eos-font-size-xl);
    font-weight: var(--eos-font-weight-bold);
    color: var(--eos-color-primary-700);
    text-align: center;
  }

  &__subtitle {
    font-size: var(--eos-font-size-m);
    color: var(--eos-color-primary-800);
    text-align: center;
    margin-top: var(--eos-space-xs);
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: var(--eos-space-m);
    margin-top: var(--eos-space-2xl);
  }
}
/* .profile-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  padding: var(--eos-space-l) var(--eos-space-m);
  background-color: var(--eos-color-bg-secondary);
}

.profile-container {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: var(--eos-radius-m);
  border: 1px solid var(--eos-color-border);
  padding: var(--eos-space-2xl);
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--eos-space-2xl);
}

.profile-icon-large {
  font-size: 64px;
  margin-bottom: var(--eos-space-l);
}

.profile-header h1 {
  margin: 0;
  font-size: var(--eos-font-size-xl);
  color: var(--eos-color-primary);
  text-align: center;
}

.profile-info {
  margin-bottom: var(--eos-space-2xl);
  text-align: center;
}

.profile-info p {
  margin: 0 0 var(--eos-space-m) 0;
  color: var(--eos-color-text-secondary);
  font-size: var(--eos-font-size-m);
}

.profile-actions,
.auth-methods {
  display: flex;
  flex-direction: column;
  gap: var(--eos-space-m);
  margin-bottom: var(--eos-space-m);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--eos-space-2xl);
}

.auth-header h1 {
  margin: 0 0 var(--eos-space-m) 0;
  font-size: var(--eos-font-size-xl);
  color: var(--eos-color-primary);
}

.auth-header p {
  margin: 0;
  color: var(--eos-color-text-secondary);
  font-size: var(--eos-font-size-m);
}

.auth-method-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--eos-space-m);
  padding: var(--eos-space-m) var(--eos-space-l);
  background: white;
  border: 2px solid var(--eos-color-border);
  border-radius: var(--eos-radius-m);
  cursor: pointer;
  transition: all var(--eos-transition-base);
  font-size: var(--eos-font-size-m);
  font-weight: var(--eos-font-weight-semibold);
  color: var(--eos-color-text);
}

.auth-method-button:hover {
  border-color: var(--eos-color-primary);
  background-color: var(--eos-color-bg-secondary);
}

.auth-method-button:active {
  opacity: 0.9;
}

.auth-method-button.telegram {
  border-color: #0088cc;
  color: #0088cc;
}

.auth-method-button.telegram:hover {
  background-color: rgba(0, 136, 204, 0.05);
}

.auth-method-button.email {
  border-color: var(--eos-color-primary);
  color: var(--eos-color-primary);
}

.auth-method-button.email:hover {
  background-color: var(--eos-color-bg-secondary);
}

.auth-method-icon {
  font-size: 24px;
}

.auth-method-text {
  flex: 1;
  text-align: left;
}

.logout-button,
.back-button {
  padding: var(--eos-space-m) var(--eos-space-l);
  border: none;
  border-radius: var(--eos-radius-m);
  font-size: var(--eos-font-size-m);
  font-weight: var(--eos-font-weight-semibold);
  cursor: pointer;
  transition: all var(--eos-transition-base);
  width: 100%;
}

.logout-button {
  background-color: var(--eos-color-primary);
  color: white;
}

.logout-button:hover:not(:disabled) {
  background-color: #1e40af;
}

.logout-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.back-button {
  background-color: var(--eos-color-bg-secondary);
  color: var(--eos-color-text);
  border: 1px solid var(--eos-color-border);
}

.back-button:hover {
  border-color: var(--eos-color-primary);
  color: var(--eos-color-primary);
}

.back-button:active {
  opacity: 0.9;
}

.auth-methods-container {
  display: flex;
  flex-direction: column;
  gap: var(--eos-space-m);
  margin-bottom: var(--eos-space-2xl);
}

.telegram-section {
  width: 100%;
}

.email-section {
  width: 100%;
  display: flex;
  justify-content: center;
}

.telegram-widget-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 80px;
}

.telegram-widget {
  display: flex;
  justify-content: center;
  width: 100%;
}

.telegram-widget iframe {
  max-width: 100%;
}

.telegram-section p,
.auth-status {
  margin-top: var(--eos-space-m);
  margin-bottom: 0;
  font-size: var(--eos-font-size-m);
  line-height: 1.5;
  text-align: center;
}

.loading {
  color: #64748b;
}

.success {
  color: #16a34a;
  font-weight: 500;
}

.error {
  color: #dc2626;
  font-weight: 500;
}

@media (max-width: 768px) {
  .profile-container {
    padding: var(--eos-space-l);
  }

  .profile-header {
    margin-bottom: var(--eos-space-l);
  }

  .profile-icon-large {
    font-size: 48px;
  }
} */
</style>
