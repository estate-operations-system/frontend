<template>
  <div class="auth">
    <h1 class="auth__title">{{ emailMode === 'register' ? 'Регистрация' : 'Вход' }}</h1>
    <p class="auth__subtitle">{{ emailMode === 'register' 
        ? 'Создайте новый аккаунт' 
        : 'Войдите в свой аккаунт' }}
    </p>

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
/* .auth {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  padding: 24px;
}

.auth__section {
  background: white;
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.auth__title {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.auth__subtitle {
  margin: 0 0 32px 0;
  color: #6b7280;
  font-size: 15px;
  line-height: 1.6;
}

.auth__content {
  margin-bottom: 32px;
}

.auth__form {
  display: flex;
  flex-direction: column;
}

.auth__form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth__field {
  display: flex;
  flex-direction: column;
}

.auth__label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

.auth__hint {
  display: block;
  margin-top: 6px;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.4;
}

.auth__button {
  margin-top: 8px;
}

.auth__status {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;

  &_success {
    background: #dcfce7;
    color: #15803d;
  }

  &_error {
    background: #fee2e2;
    color: #991b1b;
  }

  &_loading {
    background: #e0e7ff;
    color: #3730a3;
  }
}

.auth__methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.auth__method-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  appearance: none;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.auth__method-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.auth__method-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.auth__method-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.auth__telegram-widget {
  display: flex;
  justify-content: center;
  padding: 40px 0;
  min-height: 100px;
}

.auth__telegram-widget :deep(iframe) {
  max-width: 100%;
}

.auth__divider {
  height: 1px;
  background: #e5e7eb;
  margin: 24px 0;
}

.auth__footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.auth__footer-text {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.auth__switch-link {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  transition: color 0.2s ease;
  display: inline;
  margin-left: 4px;

  &:hover {
    color: #2563eb;
    text-decoration: underline;
  }

  &:active {
    color: #1d4ed8;
  }
}

@media (max-width: 480px) {
  .auth {
    padding: 16px;
  }

  .auth__section {
    padding: 32px 20px;
  }

  .auth__title {
    font-size: 24px;
  }

  .auth__methods {
    grid-template-columns: 1fr;
  }
} */
</style>
