import type { ApiResponse } from '@/types/user'

export const BASE_URL = 'http://localhost:4000'

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    console.log('API Request:', `${BASE_URL}${endpoint}`)
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    
    try {
      const data = await response.json()
      
      if (!response.ok) {
        return {
          error: data.message || `HTTP error! status: ${response.status}`,
          status: response.status
        }
      }
      
      return {
        data,
        status: response.status
      }
    } catch (jsonError) {
      // Если не JSON, получаем как текст
      const text = await response.text()
      
      if (!response.ok) {
        return {
          error: text,
          status: response.status
        }
      }
      
      return {
        data: text as T,
        status: response.status
      }
    }
    
  } catch (error) {
    return {
      error: (error as Error).message,
      status: 500
    }
  }
}