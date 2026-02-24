// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'src/',
  ssr: false,
  runtimeConfig: {
    serverUrl: '',

    public: {
      apiBase: 'https://backend-pl4x.onrender.com/'
    }
  },
  css: [
    'eos-ui-kit/dist/style.css'
  ],
  
  build: {
    transpile: ['eos-ui-kit']
  }
})
