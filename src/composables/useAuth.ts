import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ApiClient } from '~/api/apiClient'
import type { components } from '~/api/api'

type User = components["schemas"]["User"]

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface AuthResponse {
  success: boolean
  token: string
  refreshToken: string
  user?: {
    id: number
    name: string
  }
}

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_ROLE_KEY = 'userRole'

export const useAuth = () => {
  const router = useRouter()
  const apiClient = new ApiClient()

  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => {
    try {
      return !!localStorage.getItem(TOKEN_KEY)
    } catch {
      return false
    }
  })

  // Универсальная обертка для асинхронных операций
  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    isLoading.value = true
    errorMessage.value = null
    try {
      return await fn()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Operation failed'
      errorMessage.value = message
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const getToken = (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  }

  const setUserRole = (role: string): void => {
    try {
      localStorage.setItem(USER_ROLE_KEY, role)
    } catch (error) {
      console.error('Failed to set user role:', error)
    }
  }

  const setToken = (token: string, refreshToken: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    } catch (error) {
      console.error('Failed to set tokens:', error)
    }
  }

  const removeToken = (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error('Failed to remove tokens:', error)
    }
  }

  const formatUserData = (data: any): User => {
    if (!data) return data
    return {
      ...data,
      phoneNumber: data.phoneNumber || data.phone_number,
    }
  }

  const logout = async (): Promise<void> => {
    return withLoading(async () => {
      removeToken()
      user.value = null
      try {
        localStorage.removeItem(USER_ROLE_KEY)
      } catch (error) {
        console.error('Failed to remove user role:', error)
      }
      await router.push('/')
    })
  }

  const loadCurrentUser = async (): Promise<void> => {
    return withLoading(async () => {
      const token = getToken()
      if (!token) return

      const response = await apiClient.getUserById('me' as any) as any
      if (response?.data) {
        user.value = formatUserData(response.data)
        if (response.data.role) {
          setUserRole(response.data.role)
        }
      }
    })
  }

  const sendRegistrationCode = async (
    email: string,
    name: string
  ): Promise<{ success: boolean; message: string }> => {
    return withLoading(async () => {
      const response = await apiClient.sendRegistrationCode(email, name) as any

      if (response?.success) {
        return {
          success: true,
          message: response.message || 'Код отправлен на ваш email',
        }
      } else {
        throw new Error(response?.error || 'Failed to send registration code')
      }
    })
  }

  const sendLoginCode = async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    return withLoading(async () => {
      const response = await apiClient.sendLoginCode(email) as any

      if (response?.success) {
        return {
          success: true,
          message: response.message || 'Код отправлен на ваш email',
        }
      } else {
        throw new Error(response?.error || 'Failed to send login code')
      }
    })
  }

  const verifyRegistrationCode = async (
    email: string,
    code: string,
    name: string
  ): Promise<AuthResponse> => {
    return withLoading(async () => {
      const response = await apiClient.verifyRegistrationCode(email, code, name) as any

      if (response?.success && response?.token && response?.refreshToken) {
        setToken(response.token, response.refreshToken)
        const userData = response.data || {}
        user.value = userData
        if (userData.role) {
          setUserRole(userData.role)
        }
        return {
          success: true,
          token: response.token,
          refreshToken: response.refreshToken,
          user: userData,
        }
      } else {
        throw new Error(response?.error || 'Registration verification failed')
      }
    })
  }

  const verifyLoginCode = async (
    email: string,
    code: string
  ): Promise<AuthResponse> => {
    return withLoading(async () => {
      const response = await apiClient.verifyLoginCode(email, code) as any

      if (response?.success && response?.token && response?.refreshToken) {
        setToken(response.token, response.refreshToken)
        const userData = response.data || {}
        user.value = userData
        if (userData.role) {
          setUserRole(userData.role)
        }
        return {
          success: true,
          token: response.token,
          refreshToken: response.refreshToken,
          user: userData,
        }
      } else {
        throw new Error(response?.error || 'Login verification failed')
      }
    })
  }

  const initializeAuth = async () => {
    return withLoading(async () => {
      const token = getToken()
      if (token) {
        await loadCurrentUser()
      }
    })
  }

  return {
    user,
    isLoggedIn,
    isLoading,
    errorMessage,
    getToken,
    setUserRole,
    setToken,
    removeToken,
    logout,
    loadCurrentUser,
    sendRegistrationCode,
    sendLoginCode,
    verifyRegistrationCode,
    verifyLoginCode,
    initializeAuth
  }
}