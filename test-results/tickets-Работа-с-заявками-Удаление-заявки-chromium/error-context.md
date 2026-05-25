# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tickets.spec.ts >> Работа с заявками >> Удаление заявки
- Location: frontend\tests\e2e\tickets.spec.ts:113:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="password"]')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - link "Estate Operations" [ref=e5] [cursor=pointer]:
        - /url: /
      - link [ref=e6] [cursor=pointer]:
        - /url: /profile
        - img [ref=e7]
    - main [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e13]:
          - heading "Вход" [level=1] [ref=e14]
          - heading "Войдите в свой аккаунт" [level=2] [ref=e15]
        - generic [ref=e16]:
          - generic [ref=e17]:
            - textbox "Введите вашу почту" [active] [ref=e19]: test@example.com
            - button "Отправить код" [ref=e20] [cursor=pointer]:
              - generic [ref=e21]: Отправить код
          - paragraph [ref=e22]:
            - text: Нет аккаунта?
            - button "Зарегистрироваться" [ref=e23] [cursor=pointer]:
              - generic [ref=e24]: Зарегистрироваться
  - generic:
    - img
  - generic [ref=e25]:
    - button "Toggle Nuxt DevTools" [ref=e26] [cursor=pointer]:
      - img [ref=e27]
    - generic "Page load time" [ref=e30]:
      - generic [ref=e31]: "41"
      - generic [ref=e32]: ms
    - button "Toggle Component Inspector" [ref=e34] [cursor=pointer]:
      - img [ref=e35]
```

# Test source

```ts
  1  | import { Page } from '@playwright/test'
  2  | 
  3  | /**
  4  |  * Логин через email
  5  |  */
  6  | export async function loginWithEmail(
  7  |   page: Page,
  8  |   email: string = 'test@example.com',
  9  |   password: string = 'password123'
  10 | ): Promise<void> {
  11 |   await page.goto('/auth')
  12 | 
  13 |   await page.fill('input[type="email"]', email)
> 14 |   await page.fill('input[type="password"]', password)
     |              ^ Error: page.fill: Test timeout of 30000ms exceeded.
  15 | 
  16 |   await page.click('button:has-text("Войти")')
  17 | 
  18 |   // Ждем редиректа на главную страницу
  19 |   await page.waitForURL('/')
  20 | }
  21 | 
  22 | /**
  23 |  * Логин через Telegram
  24 |  * Для тестирования используется mock данные Telegram
  25 |  */
  26 | export async function loginWithTelegram(page: Page): Promise<void> {
  27 |   await page.goto('/auth')
  28 | 
  29 |   // Нажимаем кнопку "Telegram"
  30 |   const telegramButton = await page.locator('button:has-text("Telegram")')
  31 |   await telegramButton.click()
  32 | 
  33 |   // Взаимодействие с Telegram Web App проходит в отдельном окне
  34 |   // Для тестирования используется mock или intercept запроса
  35 |   // В реальном тесте нужно обработать всплывающее окно или использовать mock
  36 | }
  37 | 
  38 | /**
  39 |  * Логаут
  40 |  */
  41 | export async function logout(page: Page): Promise<void> {
  42 |   // Нажимаем на меню пользователя
  43 |   await page.click('button[aria-label="User menu"]')
  44 | 
  45 |   // Нажимаем на "Выход"
  46 |   await page.click('a:has-text("Выход")')
  47 | 
  48 |   // Ждем редиректа на страницу логина
  49 |   await page.waitForURL('/auth')
  50 | 
  51 |   // Проверяем, что токен удален
  52 |   const token = await page.evaluate(() => localStorage.getItem('token'))
  53 |   if (token) {
  54 |     throw new Error('Token not removed after logout')
  55 |   }
  56 | }
  57 | 
  58 | /**
  59 |  * Проверка, что пользователь авторизован
  60 |  */
  61 | export async function isLoggedIn(page: Page): Promise<boolean> {
  62 |   const token = await page.evaluate(() => localStorage.getItem('token'))
  63 |   return !!token
  64 | }
  65 | 
  66 | /**
  67 |  * Установка токена напрямую (для быстрой авторизации)
  68 |  */
  69 | export async function setAuthToken(page: Page, token: string, refreshToken: string): Promise<void> {
  70 |   await page.evaluate(
  71 |     ([tkn, refTkn]) => {
  72 |       localStorage.setItem('token', tkn)
  73 |       localStorage.setItem('refreshToken', refTkn)
  74 |     },
  75 |     [token, refreshToken]
  76 |   )
  77 | }
  78 | 
  79 | /**
  80 |  * Получение текущего токена
  81 |  */
  82 | export async function getAuthToken(page: Page): Promise<string | null> {
  83 |   return await page.evaluate(() => localStorage.getItem('token'))
  84 | }
  85 | 
  86 | /**
  87 |  * Ожидание загрузки элемента
  88 |  */
  89 | export async function waitForElement(page: Page, selector: string, timeout = 5000): Promise<void> {
  90 |   await page.waitForSelector(selector, { timeout })
  91 | }
  92 | 
  93 | /**
  94 |  * Проверка наличия элемента
  95 |  */
  96 | export async function elementExists(page: Page, selector: string): Promise<boolean> {
  97 |   return (await page.$(selector)) !== null
  98 | }
  99 | 
```