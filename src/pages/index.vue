<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">Система управления объектом недвижимости</h1>
      <p class="hero-subtitle">Эффективное управление жилым комплексом и взаимодействие с жильцами</p>
      
      <div class="cards-grid">
        <NuxtLink to="/users" class="card-link">
          <Card interactive>
            <div class="card-icon">👥</div>
            <h3 class="card-title">Пользователи</h3>
            <p class="card-description">Управление жильцами и их профилями</p>
          </Card>
        </NuxtLink>
        
        <NuxtLink to="/tickets" class="card-link">
          <Card interactive>
            <div class="card-icon">🎫</div>
            <h3 class="card-title">Заявки</h3>
            <p class="card-description">Система заявок и запросов от жильцов</p>
          </Card>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--eos-space-l);
  margin-top: var(--eos-space-xl);
}

.card-link {
  text-decoration: none;
  color: inherit;
}

.card-icon {
  font-size: 48px;
  margin-bottom: var(--eos-space-m);
}

.card-title {
  font-size: var(--eos-font-size-l);
  font-weight: var(--eos-font-weight-semibold);
  color: var(--eos-color-primary);
  margin-bottom: var(--eos-space-s);
  margin-top: 0;
}

.card-description {
  font-size: var(--eos-font-size-m);
  color: var(--eos-color-text-secondary);
  line-height: var(--eos-line-height-normal);
  margin: 0;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: var(--eos-font-size-xl);
  }

  .hero-subtitle {
    font-size: var(--eos-font-size-m);
  }

  .cards-grid {
    gap: var(--eos-space-m);
  }
}
</style>

