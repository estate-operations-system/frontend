<template>
  <div class="home-card" :class="{ 'home-card_center': align === 'center' }">
    <div class="home-card__header">
      <div v-if="number" class="home-card__number">{{ number }}</div>
      <h3 class="home-card__title">{{ title }}</h3>
    </div>
    <p class="home-card__description">{{ description }}</p>
    <EosButton :to="to">{{ buttonText }}</EosButton>
  </div>
</template>

<script setup lang="ts">
import { EosButton } from "eos-ui-kit";
interface Props {
  number?: number;
  title: string;
  description: string;
  to: string;
  buttonText: string;
  align?: "left" | "center";
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.home-card {
  padding: var(--eos-space-l);
  background-color: var(--eos-color-primary-50);
  text-align: left;
  border: 1px solid var(--eos-color-border);
  border-radius: var(--eos-radius-m);
  
 &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: var(--eos-space-m);
  }

  &_center {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .home-card__header {
      justify-content: center;
    }
  }

  &__number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: var(--eos-color-primary-600);
    color: var(--eos-color-primary-50);
    border-radius: 50%;
    font-size: var(--eos-font-size-l);
    font-weight: var(--eos-font-weight-bold);
  }

  &__title {
    color: var(--eos-color-primary-800);
    font-size: var(--eos-font-size-xl);
  }

  &__description {
    color: var(--eos-color-primary-900);
    margin: var(--eos-space-m) 0;
    line-height: var(--eos-line-height-normal);
  }

  &__button {
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

    &:hover {
      background-color: #1e40af;
    }

    &:active {
      opacity: 0.9;
    }
  }
}
</style>
