<template>
  <div class="profile">
    <PageTitle 
      :title="isLoggedIn ? 'Ваш профиль' : 'Вход в систему'"
      :subtitle="isLoggedIn ? 'Вы успешно авторизованы в системе' : 'Выберите способ авторизации'"
    />

    <div v-if="isLoggedIn" class="profile__card">
      <div class="p2">
        Информация о пользователе будет отображаться здесь в будущем. Сейчас это просто заглушка для демонстрации авторизации.
      </div>
      
      <div class="profile__actions">
        <EosButton @click="handleLogout" :loading="isLoading">
          Выйти
        </EosButton>
        <EosButton :variant="ButtonVariant.Secondary" to="/" :loading="isLoading">
          На главную
        </EosButton>
      </div>
    </div>

    <div v-else class="profile__card">
      <div class="profile__actions">
        <div 
          id="telegram-login-widget"
          class="telegram-widget"
        />

        <EosButton @click="loginWithEmail" :loading="isLoading">
          Вход через Email
        </EosButton>

        <EosButton :variant="ButtonVariant.Secondary" to="/" :loading="isLoading">
          На главную
        </EosButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onMounted, nextTick } from "vue";
import { useAuth } from "~/composables/useAuth";
import { ButtonVariant, EosButton } from "eos-ui-kit";
import PageTitle from "~/components/PageTitle.vue";

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
  sessionStorage.setItem('authEmailMode', 'login');
  router.push('/auth');
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
  gap: var(--eos-space-l);
  align-items: center;

  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--eos-space-l) var(--eos-space-m);
    background-color: var(--eos-color-primary-50);
    width: 100%;
    height: 100%;
    border-radius: var(--eos-radius-l);
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: var(--eos-space-m);
    margin-top: var(--eos-space-2xl);
  }
}
</style>
