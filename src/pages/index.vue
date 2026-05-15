<template>
  <Loader v-if="isLoading" />
  <div v-else class="home">
    <PageTitle 
      title="Управляйте вашим домом легко"
      subtitle="Все что нужно для комфортной жизни в одном месте"
    />
    
    <div v-if="isLoggedIn" class="home__instructions">
      <HomeCard
        :number="1"
        title="Управление пользователями"
        description="Перейдите в раздел 'Пользователи' для управления профилями жильцов и просмотра информации"
        to="/users"
        buttonText="Перейти к пользователям"
        size="m"
        align="left"
      />
      
      <HomeCard
        :number="2"
        title="Просмотр заявок"
        description="В разделе 'Заявки' вы сможете просматривать, редактировать и управлять заявками от жильцов"
        to="/tickets"
        buttonText="Перейти к заявкам"
        size="m"
        align="left"
      />
    </div>

    <div v-else class="home__auth">
      <HomeCard
        title="Вы не авторизованы :("
        description="Войдите в свой профиль, чтобы просматривать и управлять заявками от жильцов"
        to="/profile"
        buttonText="Авторизоваться"
        align="center"
        size="l"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import HomeCard from "~/components/HomeCard.vue";
import PageTitle from "~/components/PageTitle.vue";
import Loader from "~/components/Loader.vue";

const { isLoggedIn, isLoading, initializeAuth  } = useAuth();

onMounted(async () => {
  await initializeAuth();
});

watch(isLoading, (newVal) => {
  console.log('isLoading changed:', newVal);
});
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--eos-spacing-l);

  &__instructions {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: row;
    gap: var(--eos-spacing-2xl);
  }
}
</style>

