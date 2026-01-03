import { apiRequest } from '../utils/api'
import type { User, ApiResponse } from '../types/user'

export const useUserApi = () => {
  const checkServer = async (): Promise<ApiResponse<string>> => {
    try {
      const response = await fetch('http://localhost:4000')
      const data = await response.text()
      
      return {
        data,
        status: response.status
      }
    } catch (error) {
      return {
        error: (error as Error).message,
        status: 500
      }
    }
  }

  const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
    return apiRequest<User[]>('/api/users')
  }

  const getUserById = async (id: string): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/api/users/${id}`)
  }

  const createUser = async (user: Omit<User, 'id'>): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
  }

  const updateUser = async (id: string, user: Partial<User>): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
  }

  const deleteUser = async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/api/users/${id}`, {
      method: 'DELETE'
    })
  }

  return {
    checkServer,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
  }
}