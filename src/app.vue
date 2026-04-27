<template>
  <div id="app" class="app" :class="{ 'app__home': isHomePage }">
    <Header class="header"/>

    <main class="app__content">
      <NuxtPage />
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
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: var(--eos-space-m);

  &__home {
    background: url('/background.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    background-repeat: no-repeat;
  }

  &__content {
    padding-block: var(--eos-space-l);
  }
}
</style>
