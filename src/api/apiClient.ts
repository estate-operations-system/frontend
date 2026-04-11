import type { paths } from './api'

export class ApiClient {
  baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  async getUsers() {
    const res = await fetch(`${this.baseUrl}/api/users`, {
      headers: this.getAuthHeaders()
    })
    if (!res.ok) throw new Error(`Error fetching users: ${res.statusText}`)
    const json = await res.json()
    const data: paths['/api/users']['get']['responses'][200]['content']['application/json'] = json
    return data
  }

  async getUserById(id: number) {
    const res = await fetch(`${this.baseUrl}/api/users/${id}`, {
      headers: this.getAuthHeaders()
    })
    if (!res.ok) throw new Error(`Error fetching user ${id}: ${res.statusText}`)
    const json = await res.json()
    const data: paths['/api/users/{id}']['get']['responses'][200]['content']['application/json'] = json
    return data
  }

  async getAuthStatus() {
    const res = await fetch(`${this.baseUrl}/api/auth/status`, {
      headers: this.getAuthHeaders()
    })
    if (!res.ok) throw new Error(`Error checking auth status: ${res.statusText}`)
    const json = await res.json()
    return json
  }

  async getTickets() {
    const res = await fetch(`${this.baseUrl}/api/tickets`, {
      headers: this.getAuthHeaders()
    })
    if (!res.ok) throw new Error(`Error fetching tickets: ${res.statusText}`)
    const json = await res.json()
    const data: paths['/api/tickets']['get']['responses'][200]['content']['application/json'] = json
    return data
  }

  async getTicketById(id: number) {
    const res = await fetch(`${this.baseUrl}/api/tickets/${id}`, {
      headers: this.getAuthHeaders()
    })
    if (!res.ok) throw new Error(`Error fetching ticket ${id}: ${res.statusText}`)
    const json = await res.json()
    const data: paths['/api/tickets/{id}']['get']['responses'][200]['content']['application/json'] = json
    return data
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

  async telegramAuth(telegramData: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
  }) {
    const res = await fetch(`${this.baseUrl}/api/auth/telegram`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(telegramData)
    })

    const json = await res.json()

    if (!res.ok) {
      const errorMessage = json?.error || `Error telegram auth: ${res.statusText}`
      throw new Error(errorMessage)
    }

    return json
  }
}