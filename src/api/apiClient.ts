import type { paths, components } from './api'

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface VehicleParking {
  id: number
  user_id: number
  license_plate: string
  vehicle_make?: string
  vehicle_model?: string
  vehicle_color?: string
  parking_spot: string
  parking_zone?: string
  comment?: string
  created_at?: string
  updated_at?: string
}

interface VehicleParkingCreate {
  user_id: number
  license_plate: string
  vehicle_make?: string
  vehicle_model?: string
  vehicle_color?: string
  parking_spot: string
  parking_zone?: string
  comment?: string
}

interface VehicleParkingUpdate {
  license_plate?: string
  vehicle_make?: string
  vehicle_model?: string
  vehicle_color?: string
  parking_spot?: string
  parking_zone?: string
  comment?: string
}

interface RequestOptions extends RequestInit {
  retries?: number
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly tokenKey = 'token'
  private readonly refreshTokenKey = 'refreshToken'
  private readonly contentType = 'application/json'
  private readonly maxRetries = 3
  private readonly retryDelay = 1000
  private isRefreshing = false
  private refreshPromise: Promise<{ token: string; refreshToken: string } | null> | null = null

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || this.getBaseUrl()
  }

  private getBaseUrl(): string {
    if (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) {
      return process.env.VITE_API_BASE_URL
    }
    return import.meta.env.VITE_API_BASE_URL || 'https://backend-pl4x.onrender.com'
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(this.tokenKey)
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  private async refreshTokens(): Promise<{ token: string; refreshToken: string } | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true

    this.refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem(this.refreshTokenKey)
        if (!refreshToken) {
          return null
        }

        const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': this.contentType,
          },
          body: JSON.stringify({ refreshToken }),
        })

        if (!response.ok) {
          localStorage.removeItem(this.tokenKey)
          localStorage.removeItem(this.refreshTokenKey)
          return null
        }

        const data = await response.json()

        if (data.token && data.refreshToken) {
          localStorage.setItem(this.tokenKey, data.token)
          localStorage.setItem(this.refreshTokenKey, data.refreshToken)
          return { token: data.token, refreshToken: data.refreshToken }
        }

        return null
      } catch (error) {
        console.error('Token refresh failed:', error)
        localStorage.removeItem(this.tokenKey)
        localStorage.removeItem(this.refreshTokenKey)
        return null
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  private async _request<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { retries = this.maxRetries, ...fetchOptions } = options

    const finalOptions: RequestInit = {
      headers: {
        [this.contentType === 'application/json' ? 'Content-Type' : 'content-type']: this.contentType,
        ...this.getAuthHeaders(),
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    }

    try {
      const response = await fetch(url, finalOptions)

      if (response.status === 401) {
        const refreshed = await this.refreshTokens()

        if (refreshed) {
          const retryOptions: RequestInit = {
            headers: {
              [this.contentType === 'application/json' ? 'Content-Type' : 'content-type']: this.contentType,
              ...this.getAuthHeaders(),
              ...fetchOptions.headers,
            },
            ...fetchOptions,
          }

          const retryResponse = await fetch(url, retryOptions)

          if (!retryResponse.ok) {
            const body = await retryResponse.json().catch(() => ({}))
            const errorMessage = body?.error || body?.message || retryResponse.statusText
            throw new Error(errorMessage)
          }

          return retryResponse.json() as Promise<T>
        } else {
          window.location.href = '/'
          throw new Error('Session expired. Please login again.')
        }
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        const errorMessage = body?.error || body?.message || response.statusText
        throw new Error(errorMessage)
      }

      return response.json() as Promise<T>
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.retryDelay)
        return this._request(url, { ...options, retries: retries - 1 })
      }
      throw error
    }
  }

  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) return false
    const retryableMessages = ['Failed to fetch', 'Network request failed', 'timeout']
    return retryableMessages.some(msg => error.message.includes(msg))
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getUsers() {
    return this._request<paths['/api/users']['get']['responses'][200]['content']['application/json']>(
      `${this.baseUrl}/api/users`
    )
  }

  async getUserById(id: number) {
    return this._request<paths['/api/users/{id}']['get']['responses'][200]['content']['application/json']>(
      `${this.baseUrl}/api/users/${id}`
    )
  }

  async createUser(
    payload: components['schemas']['UserCreate']
  ) {
    return this._request<paths['/api/users']['post']['responses'][200]['content']['application/json']>(
      `${this.baseUrl}/api/users`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    )
  }

  async updateUser(
    id: number,
    payload: components['schemas']['UserUpdate']
  ) {
    return this._request<paths['/api/users/{id}']['put']['responses'][200]['content']['application/json']>(
      `${this.baseUrl}/api/users/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    )
  }

  async updateUserRole(id: number, payload: { role: string }) {
    return this._request(`${this.baseUrl}/api/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  async updateTicketStatus(id: number, payload: { status: string }) {
    return this._request(`${this.baseUrl}/api/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  async deleteUser(id: number) {
    return this._request(`${this.baseUrl}/api/users/${id}`, {
      method: 'DELETE',
    })
  }

  async getAuthStatus() {
    return this._request(`${this.baseUrl}/api/auth/status`)
  }

  async getTickets() {
    return this._request<paths['/api/tickets']['get']['responses'][200]['content']['application/json']>(
      `${this.baseUrl}/api/tickets`
    )
  }

  async getTicketById(id: number) {
    return this._request<paths['/api/tickets/{id}']['get']['responses'][200]['content']['application/json']>(
      `${this.baseUrl}/api/tickets/${id}`
    )
  }

  async updateTicket(
    id: number,
    payload: components['schemas']['TicketUpdate']
  ) {
    return this._request<paths['/api/tickets/{id}']['put']['responses'][200]['content']['application/json']>(
      `${this.baseUrl}/api/tickets/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    )
  }

  async deleteTicket(id: number) {
    return this._request(`${this.baseUrl}/api/tickets/${id}`, {
      method: 'DELETE',
    })
  }

  async getVehicleParking() {
    return this._request<{ success?: boolean; data?: VehicleParking[] }>(
      `${this.baseUrl}/api/vehicle-parking`
    )
  }

  async getVehicleParkingById(id: number) {
    return this._request<{ success?: boolean; data?: VehicleParking }>(
      `${this.baseUrl}/api/vehicle-parking/${id}`
    )
  }

  async createVehicleParking(payload: VehicleParkingCreate) {
    return this._request<{ success?: boolean; data?: VehicleParking }>(
      `${this.baseUrl}/api/vehicle-parking`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    )
  }

  async updateVehicleParking(id: number, payload: VehicleParkingUpdate) {
    return this._request<{ success?: boolean; data?: VehicleParking }>(
      `${this.baseUrl}/api/vehicle-parking/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    )
  }

  async deleteVehicleParking(id: number) {
    return this._request(`${this.baseUrl}/api/vehicle-parking/${id}`, {
      method: 'DELETE',
    })
  }

  async telegramAuth(telegramData: TelegramAuthData) {
    return this._request(`${this.baseUrl}/api/auth/telegram`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(telegramData),
    })
  }

  async sendRegistrationCode(email: string, name: string) {
    return this._request(`${this.baseUrl}/api/auth/send-registration-code`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        name,
      }),
    })
  }

  async verifyRegistrationCode(email: string, code: string, name: string) {
    return this._request(`${this.baseUrl}/api/auth/verify-registration-code`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        code,
        name,
      }),
    })
  }

  async sendLoginCode(email: string) {
    return this._request(`${this.baseUrl}/api/auth/send-login-code`, {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    })
  }

  async verifyLoginCode(email: string, code: string) {
    return this._request(`${this.baseUrl}/api/auth/verify-login-code`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        code,
      }),
    })
  }

  async refreshToken(refreshToken: string) {
    return this._request<{ token: string; refreshToken: string }>(
      `${this.baseUrl}/api/auth/refresh`,
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }
    )
  }

  async createTicket(payload: paths['/api/tickets']['post']['requestBody']['content']['application/json']) {
    const requestPayload = {
      ...payload,
      status: 'open'
    }

    const res = await fetch(`${this.baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(requestPayload)
    })

    const json = await res.json()

    if (!res.ok) {
      const errorMessage = json?.error || `Error creating ticket: ${res.statusText}`
      throw new Error(errorMessage)
    }

    const data: paths['/api/tickets']['post']['responses'][201]['content']['application/json'] = json
    return data
  }

  async addTicketComment(id: number, payload: { comment: string }) {
    return this._request(`${this.baseUrl}/api/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }
}