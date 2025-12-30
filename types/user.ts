export interface User {
  id?: number
  name: string
  email: string
  age: number
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}