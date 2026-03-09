import type { paths } from './api'

export class ApiClient {
  baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async getUsers() {
    const res = await fetch(`${this.baseUrl}/api/users`)
    if (!res.ok) throw new Error(`Error fetching users: ${res.statusText}`)
    const json = await res.json()
    const data: paths['/api/users']['get']['responses'][200]['content']['application/json'] = json
    return data
  }

  async getUserById(id: number) {
    const res = await fetch(`${this.baseUrl}/api/users/${id}`)
    if (!res.ok) throw new Error(`Error fetching user ${id}: ${res.statusText}`)
    const json = await res.json()
    const data: paths['/api/users/{id}']['get']['responses'][200]['content']['application/json'] = json
    return data
  }

  async getTickets() {
    const res = await fetch(`${this.baseUrl}/api/tickets`)
    if (!res.ok) throw new Error(`Error fetching tickets: ${res.statusText}`)
    const json = await res.json()
    const data: paths['/api/tickets']['get']['responses'][200]['content']['application/json'] = json
    return data
  }

  async getTicketById(id: number) {
    const res = await fetch(`${this.baseUrl}/api/tickets/${id}`)
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
        'Content-Type': 'application/json'
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
}