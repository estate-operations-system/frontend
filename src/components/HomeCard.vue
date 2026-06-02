<template>
  <EosCard
    :size="size"
    :align="align"
    class="home-card__card"
  >
    <div class="home-card__header">
      <div
        v-if="number"
        class="home-card__number h2"
      >
        {{ number }}
      </div>
      <h3 class="home-card__title h2">{{ title }}</h3>
    </div>
    <p class="home-card__description p1">{{ description }}</p>
    <EosButton :to="to">{{ buttonText }}</EosButton>
  </EosCard>
</template>

<script setup lang="ts">
import { EosButton, EosCard } from 'eos-ui-kit'
interface Props {
  number?: number
  title: string
  description: string
  to: string
  buttonText: string
  align?: 'left' | 'center'
  size?: 's' | 'm' | 'l'
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.home-card {
  &__card {
    min-width: unset;
  }

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: var(--eos-spacing-m);
  }

  &__number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--eos-line-height-tight) * var(--eos-font-size-xl));
    height: calc(var(--eos-line-height-tight) * var(--eos-font-size-xl));
    background-color: var(--eos-color-primary-600);
    color: var(--eos-color-primary-50);
    border-radius: var(--eos-radius-full);
  }

  &__title {
    color: var(--eos-color-primary-700);
  }

  &__description {
    color: var(--eos-color-primary-800);
  }
}
</style>
