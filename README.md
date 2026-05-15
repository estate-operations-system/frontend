# Estate Operations System (EOS) - Frontend

Веб-приложение для управления многоквартирным жилым комплексом. Компонент обеспечивает взаимодействие пользователей (жильцов, администраторов, юристов) с backend-системой через современный веб-интерфейс.

## Технологический стек

- **Vue 3** - реактивный фреймворк
- **Nuxt 3** - meta-framework с файловой маршрутизацией
- **TypeScript** - строгая типизация
- **Vite** - быстрая сборка и разработка
- **EOS UI Kit** - собственная библиотека компонентов
- **Playwright** - end-to-end тестирование

## Установка и запуск

### Установка зависимостей

```bash
npm install
```

### Разработка

Запуск dev-сервера на `http://localhost:3000`:

```bash
npm run dev
```

### Production сборка

```bash
npm run build
```

Локальный preview production версии:

```bash
npm run preview
```

## Структура проекта

```
src/
├── pages/           # Страницы приложения (маршруты)
├── components/      # Переиспользуемые компоненты
├── composables/     # Бизнес-логика (useAuth, и т.д.)
├── api/             # API Client и типы
├── types/           # TypeScript типы и интерфейсы
├── middleware/      # Middleware для маршрутизации
├── app.vue          # Root компонент
└── styles/          # Глобальные стили
```

## Основные команды

```bash
# Запуск dev-сервера
npm run dev

# Production сборка
npm run build

# Lint и проверка кода
npm run lint

# Форматирование кода
npm run format

# End-to-end тестирование
npm run test:e2e

# Генерация TypeScript типов из OpenAPI
npm run gen:api
```

## Генерация типов API

Типы автоматически генерируются на основе OpenAPI-схемы backend:

```bash
npm run gen:api
```

Сгенерированные типы находятся в `src/api/` и используются для типизации всех API запросов.

## Тестирование

### End-to-End тесты

Тесты покрывают ключевые пользовательские сценарии:

```bash
npm run test:e2e
```

## Переменные окружения

Создайте файл `.env.local` в корне проекта:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

## Контроль качества кода

Проект использует:
- **ESLint** - статический анализ
- **Prettier** - форматирование кода
- **Husky + lint-staged** - автоматические проверки перед коммитом

## Архитектура

### Многоуровневая структура

1. **Presentation Layer** - Vue компоненты и страницы
2. **Business Logic Layer** - Composables и обработчики
3. **Data Access Layer** - API Client с управлением авторизацией

### Управление состоянием

Используется реактивная система Vue 3 с Composition API:
- `ref` - реактивные переменные
- `computed` - вычисляемые свойства
- `watch` - отслеживание изменений

Глобальное состояние управляется через composables (useAuth и т.д.).

## Разработка компонентов

Компоненты используют EOS UI Kit:

```vue
<template>
  <EosButton @click="handleClick">Click me</EosButton>
</template>

<script setup lang="ts">
const handleClick = () => {
  console.log('Clicked!');
};
</script>
```

## Миграция и обновления

При изменении OpenAPI-схемы backend необходимо переге­нерировать типы:

```bash
npm run gen:api
```

## Лицензия

Проект разработан в рамках выпускной квалификационной работы НИУ ВШЭ.

## Дополнительные ресурсы

- [Nuxt Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [EOS UI Kit Documentation](https://github.com/estate-operations-system/ui-kit)
- [OpenAPI Specification](src/api/openapi.json)

