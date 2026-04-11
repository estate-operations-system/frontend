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
  private readonly contentType = 'application/json'
  private readonly maxRetries = 3
  private readonly retryDelay = 1000

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

  async createTicket(
    payload: components['schemas']['TicketCreate']
  ) {
    return this._request<paths['/api/tickets']['post']['responses'][201]['content']['application/json']>(
      `${this.baseUrl}/api/tickets`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
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
}