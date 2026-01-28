import { ref } from 'vue'

export function useServerStatus(url: string) {
  const status = ref('—')
  const response = ref('')

  const check = async () => {
    status.value = 'Загрузка...'
    response.value = ''

    try {
      const res = await fetch(url, {
        headers: { 'ngrok-skip-browser-warning': '1' }
      })
      const data = await res.json()
      status.value = String(res.status)
      response.value = JSON.stringify(data, null, 2)
    } catch (e: any) {
      status.value = 'Ошибка'
      response.value = e.message
    }
  }

  return { status, response, check }
}
