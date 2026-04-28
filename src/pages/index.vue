<template>
  <div class="home">
      <h1 class="home__title">Управляйте вашим домом легко</h1>
      <p class="home__subtitle">Все что нужно для комфортной жизни в одном месте</p>
      
      <div v-if="isLoggedIn" class="home__instructions">
          <HomeCard
            :number="1"
            title="Управление пользователями"
            description="Перейдите в раздел 'Пользователи' для управления профилями жильцов и просмотра информации"
            to="/users"
            buttonText="Перейти к пользователям"
          />
          
          <HomeCard
            :number="2"
            title="Просмотр заявок"
            description="В разделе 'Заявки' вы сможете просматривать, редактировать и управлять заявками от жильцов"
            to="/tickets"
            buttonText="Перейти к заявкам"
          />
      </div>

      <div v-else class="home__auth">
        <HomeCard
          title="Вы не авторизованы :("
          description="Войдите в свой профиль, чтобы просматривать и управлять заявками от жильцов"
          to="/profile"
          buttonText="Авторизоваться"
          align="center"
        />
      </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import HomeCard from "~/components/HomeCard.vue";

const { isLoggedIn } = useAuth();
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__title {
    font-size: var(--eos-font-size-2xl);
    font-weight: var(--eos-font-weight-bold);
    color: var(--eos-color-primary-700);
    text-align: center;
    margin-bottom: var(--eos-space-xs);
  }

  &__subtitle {
    font-size: var(--eos-font-size-l);
    color: var(--eos-color-primary-800);
    text-align: center;
    margin-bottom: var(--eos-space-2xl);
  }

  &__instructions {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: row;
    gap: var(--eos-space-2xl);
  }
}
</style>
