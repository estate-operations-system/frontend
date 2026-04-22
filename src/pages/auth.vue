<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Telegram Auth with Widget -->
      <div v-if="authMethod === 'telegram'" class="auth-section">
        <div class="telegram-widget-container">
          <div 
            id="telegram-login-widget"
            class="telegram-widget"
          ></div>
        </div>
        
        <p v-if="status" :class="statusClass">{{ status }}</p>
      </div>

      <!-- Email Auth -->
      <div v-else-if="authMethod === 'email'" class="auth-section">
        <h1>Вход через Email</h1>

        <div v-if="step === 1" class="form-section">
          <form @submit.prevent="handleSendCode" class="auth-form">
            <div class="form-group">
              <label>Имя:</label>
              <input
                v-model="formData.name"
                type="text"
                required
                placeholder="Введите ваше имя"
                :disabled="isLoading"
                class="custom-input"
              />
            </div>

            <div class="form-group">
              <label>Email:</label>
              <input
                v-model="formData.email"
                type="email"
                required
                placeholder="your@email.com"
                :disabled="isLoading"
                class="custom-input"
              />
            </div>

            <div class="form-group">
              <label>Telegram ID:</label>
              <input
                v-model="formData.telegramId"
                type="text"
                required
                placeholder="Ваш Telegram ID"
                :disabled="isLoading"
                class="custom-input"
              />
              <small>Узнать свой Telegram ID можно в боте @userinfobot</small>
            </div>

            <button type="submit" :disabled="isLoading" class="auth-button">
              {{ isLoading ? 'Отправка...' : 'Отправить код' }}
            </button>
          </form>
        </div>

        <div v-else-if="step === 2" class="form-section">
          <form @submit.prevent="handleVerifyCode" class="auth-form">
            <div class="form-group">
              <label>Код подтверждения:</label>
              <input
                v-model="formData.code"
                type="text"
                required
                placeholder="123456"
                :disabled="isLoading"
                class="custom-input"
              />
              <small>Код отправлен на {{ formData.email }}</small>
            </div>

            <button type="submit" :disabled="isLoading" class="auth-button">
              {{ isLoading ? 'Проверка...' : 'Подтвердить' }}
            </button>

            <button type="button" @click="step = 1" :disabled="isLoading" class="back-button">
              Назад
            </button>
          </form>
        </div>

        <p v-if="status" :class="statusClass">{{ status }}</p>
      </div>

      <!-- Method selector -->
      <div v-else class="method-selector">
        <h1>Выберите способ входа</h1>
        <div class="method-buttons">
          <button @click="selectMethod('telegram')" class="method-button telegram">
            <div class="method-icon" />
            <div class="method-title">Telegram</div>
            <div class="method-desc">Быстрый вход через Telegram</div>
          </button>

          <button @click="selectMethod('email')" class="method-button email">
            <div class="method-icon" />
            <div class="method-title">Email</div>
            <div class="method-desc">Вход через email и код</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();

const authMethod = ref<'telegram' | 'email' | null>(null);
const step = ref(1);
const status = ref('');
const statusClass = ref('');
const isLoading = ref(false);
const botUsername = ref(config.public.telegramBotUsername || 'your_bot_username');

const formData = ref({
  name: '',
  email: '',
  telegramId: '',
  code: '',
});

// Глобальная функция для Telegram виджета
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

const selectMethod = (method: 'telegram' | 'email') => {
  authMethod.value = method;
  if (method === 'telegram') {
    nextTick(() => {
      loadTelegramWidget();
    });
  }
};

const loadTelegramWidget = () => {
  // Находим контейнер
  const container = document.getElementById('telegram-login-widget');
  if (!container) {
    console.error('Container not found');
    return;
  }
  
  // Очищаем контейнер
  container.innerHTML = '';
  
  // Создаем скрипт для Telegram виджета
  const script = document.createElement('script');
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.async = true;
  script.setAttribute('data-telegram-login', botUsername.value);
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-radius', '8');
  script.setAttribute('data-request-access', 'write');
  script.setAttribute('data-onauth', 'onTelegramAuth(user)');
  script.setAttribute('data-userpic', 'true');
  
  script.onload = () => {
    console.log('Telegram widget script loaded and rendered');
  };
  
  script.onerror = (error) => {
    console.error('Failed to load Telegram widget:', error);
    status.value = 'Ошибка загрузки Telegram виджета. Проверьте настройки бота.';
    statusClass.value = 'error';
  };
  
  container.appendChild(script);
};

// Обработка прямого перехода с параметрами от бота
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
  if (!formData.value.name || !formData.value.email || !formData.value.telegramId) {
    status.value = 'Заполните все поля';
    statusClass.value = 'error';
    return;
  }

  isLoading.value = true;
  status.value = '';
  statusClass.value = '';

  try {
    // Имитация отправки - замените на реальный API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    // Имитация проверки - замените на реальный API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    status.value = 'Авторизация успешна!';
    statusClass.value = 'success';

    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  } catch (error: any) {
    status.value = error.message || 'Ошибка верификации';
    statusClass.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  console.log('Auth page mounted');
  
  // Проверяем параметры в URL
  if (route.query.id && route.query.hash) {
    authMethod.value = 'telegram';
    handleDirectAuth();
  } else if (route.query.method === 'telegram') {
    authMethod.value = 'telegram';
    nextTick(() => {
      loadTelegramWidget();
    });
  } else if (route.query.method === 'email') {
    authMethod.value = 'email';
  }
});
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  background: #ffffff;
  padding: 16px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.auth-card h1 {
  margin: 0 0 30px 0;
  color: #2563eb;
  font-size: 24px;
  font-weight: 700;
}

.auth-section h1 {
  display: none;
}

.method-selector {
  padding: 20px 0;
}

.method-selector h1 {
  margin: 0 0 40px 0;
  color: #1f2937;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.method-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
}

.method-button {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 35px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  text-align: center;
  flex: 1;
}

.method-button:hover {
  border-color: #3b82f6;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
  transform: translateY(-3px);
}

.method-button.telegram:hover {
  border-color: #0088cc;
  box-shadow: 0 10px 25px rgba(0, 136, 204, 0.15);
}

.method-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.method-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1f2937;
}

.method-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.auth-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.custom-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.custom-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.custom-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.form-group small {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #6b7280;
}

.auth-button {
  width: 100%;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.auth-button:hover:not(:disabled) {
  background: #2563eb;
}

.auth-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.back-button {
  width: 100%;
  background: transparent;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 12px;
}

.back-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.telegram-widget-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 80px 0 50px 0;
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

p {
  margin-top: 20px;
  margin-bottom: 0;
  font-size: 15px;
  line-height: 1.5;
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

@media (max-width: 480px) {
  .method-buttons {
    flex-direction: column;
    align-items: center;
  }

  .method-button {
    min-width: 280px;
  }

  .auth-card {
    padding: 30px 20px;
  }
}
</style>