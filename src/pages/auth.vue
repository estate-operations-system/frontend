<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Авторизация через Telegram...</h1>
      <div class="spinner"></div>
      <p v-if="status" :class="statusClass">{{ status }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from '#app';
import { ref, onMounted } from 'vue';

const router = useRouter();
const route = useRoute();
const status = ref('');
const statusClass = ref('');

onMounted(async () => {
  console.log('Auth page loaded with query:', route.query);

  try {
    // Get auth data from URL query parameters
    const authData = {
      id: route.query.id,
      first_name: route.query.first_name,
      last_name: route.query.last_name,
      username: route.query.username,
      photo_url: route.query.photo_url,
      auth_date: route.query.auth_date,
      hash: route.query.hash,
    };

    console.log('Auth data from URL:', authData);

    if (!authData.id || !authData.hash) {
      throw new Error('Missing required auth parameters');
    }

    status.value = 'Отправка данных на сервер...';
    statusClass.value = 'loading';

    // Send to backend
    const response = await fetch('https://backend-pl4x.onrender.com/api/auth/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authData),
      credentials: 'include',
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Backend result:', result);

    if (result.success && result.data) {
      status.value = `✓ Авторизация успешна! Привет, ${result.data.name}`;
      statusClass.value = 'success';
      console.log('User authenticated:', result.data);

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 0);
    } else {
      throw new Error(result.error || 'Backend returned unsuccessful response');
    }
  } catch (error) {
    console.error('Auth error:', error);
    status.value = `✗ Ошибка авторизации: ${(error as Error).message}`;
    statusClass.value = 'error';

    // Redirect back to home after 3 seconds
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }
});
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 400px;
}

.auth-card h1 {
  margin: 0 0 30px 0;
  color: #2563eb;
  font-size: 24px;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 20px auto;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

p {
  margin-top: 20px;
  font-size: 16px;
  min-height: 24px;
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
</style>
