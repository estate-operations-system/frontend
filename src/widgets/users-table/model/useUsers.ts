import { ref } from 'vue'
import type { User } from '@/entities/user'

export function useUsers(url: string) {
  const users = ref<User[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const fetchUsers = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await fetch(url + 'api/users', {
        headers: { 'ngrok-skip-browser-warning': '1' }
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const data = await res.json()

      if (data.success && data.users) {
        users.value = data.users
      } else if (Array.isArray(data)) {
        users.value = data
      } else if (data.data && Array.isArray(data.data)) {
        users.value = data.data
      } else {
        throw new Error('Неверный формат данных')
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers
  }
}
