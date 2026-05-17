import apiClient from './client'
import type { User, UserFilters } from '@/lib/types/user'
import type { Pagination } from '@/lib/types/common'

interface BeUserListResponse {
  success: boolean
  data: User[]
  pagination: Pagination
}

export async function listUsers(filters: UserFilters): Promise<{ users: User[]; pagination: Pagination }> {
  const params: Record<string, string | number> = {}
  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit
  if (filters.q) params.q = filters.q
  if (filters.status && filters.status !== 'all') params.status = filters.status

  const res = await apiClient.get<BeUserListResponse>('/api/v1/admin/users', { params })
  return { users: res.data.data, pagination: res.data.pagination }
}

export async function banUser(id: string, reason: string): Promise<User> {
  const res = await apiClient.put<{ data: User }>(`/api/v1/admin/users/${id}/ban`, { reason })
  return res.data.data
}

export async function unbanUser(id: string): Promise<User> {
  const res = await apiClient.put<{ data: User }>(`/api/v1/admin/users/${id}/unban`)
  return res.data.data
}
