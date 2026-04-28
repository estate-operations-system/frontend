# EOS UI Kit - UI Component Library

Vue 3 + TypeScript + Vite компонентная библиотека для Estate Operations System.

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Разработка с горячей перезагрузкой
npm run dev

# Запуск Storybook
npm run storybook

# Сборка для production
npm run build

# Выполнить линтеры
npm run lint

# Исправить ошибки линтеров
npm run lint:fix

# Форматировать код
npm run format
```

## Качество кода

Проект использует:
- **ESLint** — проверка TypeScript/Vue
- **Prettier** — форматирование (без точек с запятой, без трейлинг-запятых)
- **Stylelint** — проверка CSS/SCSS с БЭМ нотацией
- **Husky** — Git hooks для автоматических проверок на каждом коммите
- **Lint-Staged** — запуск проверок только на измененных файлах

**Подробнее**: см. [LINTERS.md](./LINTERS.md) и [HUSKY.md](./HUSKY.md)

## Структура проекта

```
src/
├── components/      # Vue компоненты
│   ├── button/     # Кнопка
│   ├── input/      # Инпут
│   ├── icons/      # Иконки (автогенерируются)
│   └── ...
├── styles/         # Глобальные стили (SCSS)
├── index.ts        # Экспорты компонентов
└── main.ts         # Точка входа Storybook
```

## Компоненты

Все компоненты экспортируются с приставкой `Eos`:
- `EosButton`
- `EosInput`
- `EosAccountIcon`
- и т.д.

## Git Hooks (Husky)

При каждом коммите автоматически:
1. Запускается ESLint на TypeScript/Vue файлах
2. Запускается Stylelint на CSS/SCSS файлах
3. Все файлы форматируются Prettier
4. Коммит блокируется если найдены ошибки

Пропустить проверку: `git commit --no-verify`

## Иконки

Для добавления иконок:
1. Добавьте SVG файл в `src/icons/`
2. Запустите `npm run generate-icons`
3. Компоненты автоматически создадутся в `src/components/icons/`

## Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
