<template>
  <div class="auth">
    <h1 class="auth__title h1">{{ emailMode === 'register' ? 'Регистрация' : 'Вход' }}</h1>
    <h2 class="auth__subtitle h2">{{ emailMode === 'register' 
        ? 'Создайте новый аккаунт' 
        : 'Войдите в свой аккаунт' }}
    </h2>

    <form @submit.prevent="step === 1 ? handleSendCode() : handleVerifyCode()" class="auth__form">
      <template v-if="step === 1">
        <EosInput
          v-if="emailMode === 'register'"
          v-model="formData.name"
          :type="InputType.Text"
          placeholder="Введите ваше имя"
          :disabled="isLoading"
        />

        <EosInput
          v-model="formData.email"
          :type="InputType.Email"
          placeholder="your@email.com"
          :disabled="isLoading"
        />

        <EosButton 
          type="submit"
          :loading="isLoading"
        >
          {{'Отправить код'}}
        </EosButton>
      </template>

      <template v-else-if="step === 2">
        <EosInput
          v-model="formData.code"
          :type="InputType.Text"
          placeholder="Код из письма"
          :disabled="isLoading"
        />

        <EosButton 
          type="submit"
          :loading="isLoading"
        >
          {{ 'Подтвердить' }}
        </EosButton>
      </template>
    </form>

    <p class="auth__footer">
      {{ emailMode === 'register' 
        ? 'Уже есть аккаунт?' 
        : 'Нет аккаунта?' }}
      <EosButton :variant="ButtonVariant.Tertiary" @click="switchEmailMode">
        {{
          emailMode === 'register'
          ? 'Войти'
          : 'Зарегистрироваться'
        }}
      </EosButton>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { EosButton, EosInput, ButtonVariant, InputType } from 'eos-ui-kit';

const { 
  sendRegistrationCode, 
  verifyRegistrationCode,
  sendLoginCode,
  verifyLoginCode,
} = useAuth();

const route = useRoute();

const authMethod = ref<'telegram' | 'email' | null>(null);
const emailMode = ref<'login' | 'register'>('login');
const step = ref(1);
const status = ref('');
const statusClass = ref('');
const isLoading = ref(false);

const formData = ref({
  name: '',
  email: '',
  code: '',
});

(window as any).onTelegramAuth = async (user: any) => {
  console.log('Telegram auth callback received:', user);
  status.value = 'Отправка данных на сервер...';
  statusClass.value = 'loading';
  
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
      
      status.value = `Авторизация успешна! Привет, ${user.first_name || 'пользователь'}`;
      statusClass.value = 'success';

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else {
      throw new Error('Не получен токен от сервера');
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    status.value = `Ошибка: ${error.message}`;
    statusClass.value = 'error';
  }
};

const switchEmailMode = () => {
  emailMode.value = emailMode.value === 'login' ? 'register' : 'login';
  step.value = 1;
  formData.value = { name: '', email: '', code: '' };
  status.value = '';
};

const handleDirectAuth = async () => {
  const authData = {
    id: Number(route.query.id),
    first_name: route.query.first_name as string || '',
    last_name: route.query.last_name as string || '',
    username: route.query.username as string || '',
    photo_url: route.query.photo_url as string || '',
    auth_date: Number(route.query.auth_date),
    hash: route.query.hash as string,
  };
  
  console.log('Direct auth data:', authData);
  
  if (authData.id && authData.hash) {
    await (window as any).onTelegramAuth(authData);
  }
};

const handleSendCode = async () => {
  isLoading.value = true;
  status.value = '';
  statusClass.value = '';

  try {
    if (emailMode.value === 'register') {
      if (!formData.value.name || !formData.value.email) {
        status.value = 'Заполните имя и email';
        statusClass.value = 'error';
        isLoading.value = false;
        return;
      }
      await sendRegistrationCode(formData.value.email, formData.value.name);
    } else {
      if (!formData.value.email) {
        status.value = 'Введите email';
        statusClass.value = 'error';
        isLoading.value = false;
        return;
      }
      await sendLoginCode(formData.value.email);
    }

    status.value = 'Код отправлен на ваш email';
    statusClass.value = 'success';
    step.value = 2;
  } catch (error: any) {
    status.value = error.message || 'Ошибка отправки кода';
    statusClass.value = 'error';
  } finally {
    isLoading.value = false;
  }
};


const handleVerifyCode = async () => {
  if (!formData.value.code) {
    status.value = 'Введите код подтверждения';
    statusClass.value = 'error';
    return;
  }

  isLoading.value = true;
  status.value = '';
  statusClass.value = '';

  try {
    if (emailMode.value === 'register') {
      await verifyRegistrationCode(
        formData.value.email,
        formData.value.code,
        formData.value.name
      );
    } else {
      await verifyLoginCode(formData.value.email, formData.value.code);
    }
    
    status.value = 'Авторизация успешна!';
    statusClass.value = 'success';

    window.location.href = '/';
  } catch (error: any) {
    status.value = error.message || 'Ошибка верификации';
    statusClass.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  console.log('Auth page mounted');
  
  if (route.query.id && route.query.hash) {
    authMethod.value = 'telegram';
    handleDirectAuth();
  } else {
    // Проверяем sessionStorage на сохраненный режим email авторизации
    const savedEmailMode = sessionStorage.getItem('authEmailMode') as 'login' | 'register' | null;
    if (savedEmailMode) {
      authMethod.value = 'email';
      emailMode.value = savedEmailMode;
      sessionStorage.removeItem('authEmailMode');
    }
  }
});

</script>

<style scoped lang="scss">
.auth {
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
    color: var(--eos-color-primary-700);
    text-align: center;
  }

  &__subtitle {
    color: var(--eos-color-primary-800);
    text-align: center;
    margin-top: var(--eos-space-xs);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: var(--eos-space-m);
    margin-top: var(--eos-space-xl);
  }

  &__footer {
    text-align: center;
    padding-top: var(--eos-space-m);
  }
}
</style>
