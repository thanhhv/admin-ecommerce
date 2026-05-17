import apiClient from './client'

interface LoginResponse {
  accessToken: string
  admin: {
    id: string
    name: string
    email: string
  }
}

interface RefreshResponse {
  accessToken: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<{ data: LoginResponse }>('/api/v1/auth/admin/login', {
    email,
    password,
  })
  return res.data.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/v1/auth/logout')
}

export async function refresh(): Promise<RefreshResponse> {
  const res = await apiClient.post<{ data: RefreshResponse }>('/api/v1/auth/refresh')
  return res.data.data
}
