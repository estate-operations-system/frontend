<template>
    <div class="header">
      <NuxtLink to="/" class="header__title">Estate Operations</NuxtLink>
      <div v-if="isLoggedIn" class="header__links">
        <NuxtLink to="/users" class="header__link">Пользователи</NuxtLink>
        <NuxtLink to="/tickets" class="header__link">Заявки</NuxtLink>
      </div>
      <NuxtLink to="/profile" class="header__profile-button">
        <EosAccountIcon/>
      </NuxtLink>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuth } from "~/composables/useAuth";
import { EosAccountIcon } from "eos-ui-kit";

const router = useRouter();
const { isLoggedIn } = useAuth();
</script>

<style lang="scss" scoped>
.header {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--eos-spacing-m) var(--eos-spacing-l);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: max(100%, 1600px);
  color: var(--eos-color-primary-600);

  background-color: var(--eos-color-primary-50);
  border-radius: var(--eos-radius-l);
  box-shadow: var(--eos-shadow-m);

  &__title {
    font-size: var(--eos-font-size-xl);
    font-weight: var(--eos-font-weight-bold);
    color: var(--eos-color-primary-600);

    &:hover {
      color: var(--eos-color-primary-500);
    }

    &:active {
      color: var(--eos-color-primary-700);
    }
  }

  &__links {
    display: flex;
    gap: var(--eos-spacing-xl);
    align-items: center;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  &__link {
    font-size: var(--eos-font-size-l);
    font-weight: var(--eos-font-weight-semibold);

    &:hover {
      color: var(--eos-color-primary-500);
    }

    &:active {
      color: var(--eos-color-primary-700);
    }
  }

  &__profile-button {
    height: 40px;
    aspect-ratio: 1 / 1;

    &:hover {
      color: var(--eos-color-primary-500);
    }

    &:active {
      color: var(--eos-color-primary-700);
    }
  }
}
</style>

