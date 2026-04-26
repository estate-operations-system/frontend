<template>
  <div id="app" :class="{ 'app--home': isHomePage }">
    <Header class="header"/>

    <main class="main-content" :class="{ 'main-content--full-screen': isHomePage }">
      <div v-if="!isHomePage" class="main-content__container">
        <NuxtPage />
      </div>
      <template v-else>
        <NuxtPage />
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "~/composables/useAuth";
import Header from "~/components/Header.vue";

const router = useRouter();
const { isLoggedIn, loadCurrentUser } = useAuth();

const isHomePage = computed(() => router.currentRoute.value.path === '/');

onMounted(async () => {
  if (isLoggedIn.value) {
    await loadCurrentUser()
  }
});
</script>

<style lang="scss">
html, body {
  font-family: var(--eos-font-family);
  color: var(--eos-color-primary-950);
  background-color: var(--eos-color-primary-50);
  height: 100%;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: var(--eos-space-m);

  &.app--home {
    background: url('/background.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    background-repeat: no-repeat;
  }
}

.main-content {
  flex: 1;
  background-color: var(--eos-color-primary-50);
  width: 100%;
  padding: var(--eos-space-l);
}

.main-content--full-screen {
  max-width: none;
  margin: 0;
  padding: 0;
  background-color: transparent;
  display: flex;
  flex-direction: column;
}

.main-content__container {
  max-width: 1600px;
  margin: 0 auto;
  height: 100%;
}

.header {
  flex-shrink: 0;
}

#app.app--home :deep(.header__wrapper) {
  margin: 0;
  padding: var(--eos-space-m) var(--eos-space-l);
}
</style>
