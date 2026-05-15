export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'src/',
  ssr: false,
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://backend-pl4x.onrender.com/',
      botToken: process.env.NUXT_PUBLIC_BOT_TOKEN || 'your_bot_token',
      telegramBotUsername:
        process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'your_bot_username',
    },
  },
  css: [
    'eos-ui-kit/dist/style.css'
  ],
  
  build: {
    transpile: ['eos-ui-kit']
  },
  vite: {
    server: {
      allowedHosts: [
        process.env.NUXT_PUBLIC_NGROK_URL || '',
        `woolstapling-johnson-synergistically.ngrok-free.dev`
      ]
    }
  }
})
