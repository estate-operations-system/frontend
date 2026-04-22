<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">Система управления объектом недвижимости</h1>
      <p class="hero-subtitle">Эффективное управление жилым комплексом и взаимодействие с жильцами</p>
      
      <!-- Authorized User - Instructions -->
      <div v-if="isLoggedIn" class="instructions">
        <h2>Добро пожаловать!</h2>
        <div class="instruction-items">
          <div class="instruction-item">
            <div class="instruction-number">1</div>
            <h3>Управление пользователями</h3>
            <p>Перейдите в раздел "Пользователи" для управления профилями жильцов и просмотра информации</p>
            <NuxtLink to="/users">
              <button class="action-button">Перейти к пользователям</button>
            </NuxtLink>
          </div>
          
          <div class="instruction-item">
            <div class="instruction-number">2</div>
            <h3>Просмотр заявок</h3>
            <p>В разделе "Заявки" вы сможете просматривать, редактировать и управлять заявками от жильцов</p>
            <NuxtLink to="/tickets">
              <button class="action-button">Перейти к заявкам</button>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Not Authorized - Login Prompt -->
      <div v-else class="login-prompt">
        <p class="prompt-text">Для доступа к системе необходимо авторизоваться</p>
        <button @click="goToLoginPage" class="auth-button">Авторизоваться</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import { useRouter } from "vue-router";

const router = useRouter();
const { isLoggedIn } = useAuth();

const goToLoginPage = () => {
  router.push('/profile');
};
</script>

<style lang="css" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: var(--eos-space-l) var(--eos-space-m);
}

.hero {
  max-width: 900px;
  width: 100%;
  text-align: center;
}

.hero-title {
  font-size: var(--eos-font-size-2xl);
  font-weight: var(--eos-font-weight-bold);
  color: var(--eos-color-primary);
  margin-bottom: var(--eos-space-m);
  line-height: var(--eos-line-height-tight);
}

.hero-subtitle {
  font-size: var(--eos-font-size-l);
  color: var(--eos-color-text-secondary);
  margin-bottom: var(--eos-space-2xl);
  line-height: var(--eos-line-height-normal);
}

/* Instructions for authorized users */
.instructions {
  margin-top: var(--eos-space-xl);
}

.instructions h2 {
  font-size: var(--eos-font-size-xl);
  color: var(--eos-color-primary);
  margin-bottom: var(--eos-space-l);
}

.instruction-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--eos-space-l);
  margin-top: var(--eos-space-l);
}

.instruction-item {
  padding: var(--eos-space-l);
  background-color: var(--eos-color-bg-secondary);
  text-align: left;
  border: 1px solid var(--eos-color-border);
  border-radius: var(--eos-radius-m);
}

.instruction-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--eos-color-primary);
  color: white;
  border-radius: 50%;
  font-size: var(--eos-font-size-l);
  font-weight: var(--eos-font-weight-bold);
  margin-bottom: var(--eos-space-m);
}

.instruction-item h3 {
  color: var(--eos-color-text);
  margin: var(--eos-space-m) 0;
  font-size: var(--eos-font-size-l);
}

.instruction-item p {
  color: var(--eos-color-text-secondary);
  margin: var(--eos-space-m) 0;
  line-height: var(--eos-line-height-normal);
}

.action-button {
  margin-top: var(--eos-space-m);
  padding: var(--eos-space-s) var(--eos-space-m);
  background-color: var(--eos-color-primary);
  color: white;
  border: none;
  border-radius: var(--eos-radius-m);
  font-size: var(--eos-font-size-m);
  font-weight: var(--eos-font-weight-semibold);
  cursor: pointer;
  transition: background-color var(--eos-transition-base);
  width: 100%;
}

.action-button:hover {
  background-color: #1e40af;
}

.action-button:active {
  opacity: 0.9;
}

/* Login prompt for unauthorized users */
.login-prompt {
  margin-top: var(--eos-space-2xl);
  padding: var(--eos-space-2xl);
  background-color: var(--eos-color-bg-secondary);
}

.prompt-text {
  font-size: var(--eos-font-size-l);
  color: var(--eos-color-text);
  margin-bottom: var(--eos-space-l);
}

.auth-button {
  padding: var(--eos-space-m) var(--eos-space-2xl);
  background-color: var(--eos-color-primary);
  color: white;
  border: none;
  border-radius: var(--eos-radius-m);
  font-size: var(--eos-font-size-m);
  font-weight: var(--eos-font-weight-semibold);
  cursor: pointer;
  transition: background-color var(--eos-transition-base);
}

.auth-button:hover {
  background-color: #1e40af;
}

.auth-button:active {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: var(--eos-font-size-xl);
  }

  .hero-subtitle {
    font-size: var(--eos-font-size-m);
  }

  .instruction-items {
    grid-template-columns: 1fr;
  }
}
</style>

