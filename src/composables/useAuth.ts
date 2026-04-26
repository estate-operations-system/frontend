import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ApiClient } from '~/api/apiClient'
import type { components } from '~/api/api'

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
  const user = ref<{ id?: number; name?: string; role?: string } | null>(null)

  const isLoggedIn = computed(() => {
    try {
      return !!localStorage.getItem(TOKEN_KEY)
    } catch {
      return false
    }
  })

  const getToken = (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  }

  const getRefreshToken = (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    } catch {
      return null
    }
  }

  const getUserRole = (): string | null => {
    try {
      return localStorage.getItem(USER_ROLE_KEY)
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

  const logout = async (): Promise<void> => {
    isLoading.value = true
    try {
      removeToken()
      user.value = null
      try {
        localStorage.removeItem(USER_ROLE_KEY)
      } catch (error) {
        console.error('Failed to remove user role:', error)
      }
      await router.push('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed'
      errorMessage.value = message
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const loadCurrentUser = async (): Promise<void> => {
    try {
      const token = getToken()
      console.log('loadCurrentUser: token exists:', !!token)
      if (!token) return

      const response = await apiClient.getUserById('me' as any) as any
      console.log('loadCurrentUser response:', response)
      if (response?.data) {
        user.value = response.data
        console.log('Current user loaded:', response.data, 'role:', response.data.role)
        if (response.data.role) {
          setUserRole(response.data.role)
        }
      }
    } catch (error) {
      console.error('Failed to load current user:', error)
    }
  }

  const authenticateWithTelegram = async (
    telegramData: TelegramAuthData
  ): Promise<AuthResponse> => {
    isLoading.value = true
    errorMessage.value = null

    try {
      const response = await apiClient.telegramAuth(telegramData) as any

      if (response?.token && response?.refreshToken) {
        setToken(response.token, response.refreshToken)
        const userData = response.data || {}
        user.value = userData
        if (userData.role) {
          setUserRole(userData.role)
        }
        // Load full user data with role
        await loadCurrentUser()
        return {
          success: true,
          token: response.token,
          refreshToken: response.refreshToken,
          user: userData,
        }
      } else {
        throw new Error('Token not received from server')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      errorMessage.value = message
      console.error('Telegram auth failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const sendVerificationCode = async (
    email: string,
    telegramId: string,
    name: string
  ): Promise<{ success: boolean; message: string }> => {
    isLoading.value = true
    errorMessage.value = null

    try {
      const response = await apiClient.sendVerificationCode(email, telegramId, name) as any

      if (response?.success) {
        return {
          success: true,
          message: response.message || 'Код отправлен на ваш email',
        }
      } else {
        throw new Error(response?.error || 'Failed to send verification code')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send verification code'
      errorMessage.value = message
      console.error('Send verification code failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const verifyCode = async (
    email: string,
    code: string,
    telegramId: string,
    name: string
  ): Promise<AuthResponse> => {
    isLoading.value = true
    errorMessage.value = null

    try {
      const response = await apiClient.verifyCode(email, code, telegramId, name) as any

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
        throw new Error(response?.error || 'Verification failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed'
      errorMessage.value = message
      console.error('Code verification failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const clearError = (): void => {
    errorMessage.value = null
  }

  return {
    user,
    isLoggedIn,
    isLoading,
    errorMessage,
    getToken,
    getRefreshToken,
    getUserRole,
    setUserRole,
    setToken,
    removeToken,
    logout,
    authenticateWithTelegram,
    sendVerificationCode,
    verifyCode,
    clearError,
    loadCurrentUser,
  }
}
