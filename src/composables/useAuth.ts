import { ref, computed } from 'vue';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    first_name: string;
  };
}

const TOKEN_KEY = 'token';

export const useAuth = () => {
  const config = useRuntimeConfig();
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);

  const isLoggedIn = computed(() => {
    if (process.client) {
      return !!localStorage.getItem(TOKEN_KEY);
    }
    return false;
  });

  const getToken = () => {
    if (process.client) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  };

  const setToken = (token: string) => {
    if (process.client) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  };

  const logout = async () => {
    isLoading.value = true;
    try {
      if (process.client) {
        localStorage.removeItem(TOKEN_KEY);
        await navigateTo('/');
      }
    } finally {
      isLoading.value = false;
    }
  };

  const authenticateWithTelegram = async (user: TelegramUser) => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      const apiUrl = config.public.apiBase || 'http://localhost:4000/';
      const response = await fetch(`${apiUrl}api/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Ошибка авторизации: ${response.status}`
        );
      }

      const result: AuthResponse = await response.json();

      if (result.token) {
        setToken(result.token);
        return result;
      } else {
        throw new Error('Токен не получен');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      errorMessage.value = message;
      console.error('Auth failed:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    errorMessage.value = null;
  };

  return {
    isLoggedIn,
    isLoading,
    errorMessage,
    getToken,
    setToken,
    logout,
    authenticateWithTelegram,
    clearError,
  };
};
