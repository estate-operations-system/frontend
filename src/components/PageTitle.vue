<template>
  <div
    class="page-title"
    :class="{ 'page-title_with-content': hasContent }"
  >
    <div class="page-title__text">
      <h1 class="page-title__title h1">{{ title }}</h1>
      <h2 v-if="subtitle" class="page-title__subtitle h2">{{ subtitle }}</h2>
    </div>
    <div v-if="$slots.default" class="page-title__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSlots, computed } from 'vue'

interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()

const slots = useSlots()

const hasContent = computed(() => {
  return !!slots.default
})
</script>

<style scoped lang="scss">
.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--eos-spacing-m);
  width: 100%;

  &_with-content {
    justify-content: space-between;
    text-align: left;
    flex-direction: row;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: var(--eos-spacing-xs);
  }

  &__title {
    color: var(--eos-color-primary-600);
  }

  &__subtitle {
    color: var(--eos-color-primary-700);
  }

  &__content {
    display: flex;
    align-items: center;
    gap: var(--eos-spacing-m);
  }
}
</style>

