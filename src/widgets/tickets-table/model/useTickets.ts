import { ref } from 'vue'
import type { Ticket } from '@/entities/ticket'

export function useTickets(url: string) {
  const tickets = ref<Ticket[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTickets = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await fetch(url + 'api/users', {
        headers: { 'ngrok-skip-browser-warning': '1' }
      })
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`)

      const data = await res.json()

      if (Array.isArray(data)) tickets.value = data
      else if (Array.isArray(data.tickets)) tickets.value = data.tickets
      else if (data.success && Array.isArray(data.data)) tickets.value = data.data
      else tickets.value = []

    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return { tickets, loading, error, fetchTickets }
}
