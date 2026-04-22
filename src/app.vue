<template>
  <div id="app">
    <nav class="nav">
      <div class="nav-content">
        <button @click="goToHome" class="nav-title">Estate Operations</button>
        <div v-if="isLoggedIn" class="nav-links">
          <a @click="() => router.push('/users')" class="nav-link">Пользователи</a>
          <a @click="() => router.push('/tickets')" class="nav-link">Заявки</a>
        </div>
        <button v-if="isLoggedIn" @click="goToProfile" class="profile-button">
          <EosAccountIcon class="profile-icon"/>
        </button>
      </div>
    </nav>

    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "~/composables/useAuth";
import { EosAccountIcon } from "eos-ui-kit";

const router = useRouter();
const { isLoggedIn, logout, isLoading } = useAuth();

const goToHome = () => {
  router.push('/');
};

const goToProfile = () => {
  router.push('/profile');
};

const handleLogout = async () => {
  try {
    await logout()
    window.location.reload()
  } catch (error) {
    console.error('Logout failed:', error)
  }
};
</script>

<style scoped>
.profile-button {
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--eos-transition-base);
}

.profile-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.profile-button:active {
  background-color: rgba(255, 255, 255, 0.2);
}

.profile-icon {
  width: 24px;
  height: 24px;
  color: white;
}
</style>

<style lang="css">
:root {
  --eos-color-primary: #2563eb;
  --eos-color-primary-dark: #1e40af;
  --eos-color-primary-light: #60a5fa;
  --eos-color-secondary: #64748b;
  --eos-color-secondary-dark: #475569;
  --eos-color-secondary-light: #cbd5e1;
  --eos-color-success: #16a34a;
  --eos-color-success-light: #86efac;
  --eos-color-error: #dc2626;
  --eos-color-error-light: #fca5a5;
  --eos-color-warning: #f59e0b;
  --eos-color-warning-light: #fcd34d;
  --eos-color-info: #3b82f6;
  --eos-color-info-light: #93c5fd;
  --eos-color-text: #0f172a;
  --eos-color-text-secondary: #475569;
  --eos-color-text-tertiary: #94a3b8;
  --eos-color-text-disabled: #cbd5e1;
  --eos-color-bg: #ffffff;
  --eos-color-bg-secondary: #f8fafc;
  --eos-color-bg-tertiary: #f1f5f9;
  --eos-color-border: #e2e8f0;
  --eos-color-border-dark: #cbd5e1;

  --eos-space-xs: 4px;
  --eos-space-s: 8px;
  --eos-space-m: 16px;
  --eos-space-l: 24px;
  --eos-space-xl: 32px;
  --eos-space-2xl: 48px;

  --eos-radius-s: 4px;
  --eos-radius-m: 8px;
  --eos-radius-l: 12px;
  --eos-radius-full: 9999px;

  --eos-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  --eos-font-size-xs: 12px;
  --eos-font-size-s: 14px;
  --eos-font-size-m: 16px;
  --eos-font-size-l: 20px;
  --eos-font-size-xl: 24px;
  --eos-font-size-2xl: 32px;

  --eos-font-weight-regular: 400;
  --eos-font-weight-medium: 500;
  --eos-font-weight-semibold: 600;
  --eos-font-weight-bold: 700;

  --eos-line-height-tight: 1.2;
  --eos-line-height-normal: 1.5;
  --eos-line-height-relaxed: 1.75;

  --eos-shadow-xs: none;
  --eos-shadow-s: none;
  --eos-shadow-m: none;
  --eos-shadow-l: none;
  --eos-shadow-xl: none;

  --eos-transition-fast: 150ms ease;
  --eos-transition-base: 200ms ease;
  --eos-transition-slow: 300ms ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: var(--eos-font-family);
  color: var(--eos-color-text);
  background-color: var(--eos-color-bg);
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>

<style lang="css" scoped>
.nav {
  background-color: var(--eos-color-primary);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--eos-space-m);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--eos-space-l);
}

.nav-title {
  font-size: var(--eos-font-size-xl);
  font-weight: var(--eos-font-weight-bold);
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity var(--eos-transition-base);
}

.nav-title:hover {
  opacity: 0.8;
}

.nav-title:active {
  opacity: 0.7;
}

.nav-links {
  display: flex;
  gap: var(--eos-space-l);
  align-items: center;
}

.nav-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  cursor: pointer;
  font-size: var(--eos-font-size-m);
  font-weight: var(--eos-font-weight-medium);
  padding: var(--eos-space-s) var(--eos-space-m);
  border-radius: var(--eos-radius-s);
  transition: all var(--eos-transition-base);
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.95);
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link:active {
  background-color: rgba(255, 255, 255, 0.15);
}

.main-content {
  flex: 1;
  background-color: var(--eos-color-bg-secondary);
  padding: var(--eos-space-l);
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: var(--eos-space-m);
  }

  .nav-links {
    width: 100%;
    justify-content: space-around;
  }

  .nav-title {
    font-size: var(--eos-font-size-l);
  }

  .main-content {
    padding: var(--eos-space-m);
  }
}


.profile-icon {
  color: white;
}
</style>
