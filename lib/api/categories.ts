import apiClient from './client'
import type { Category } from '@/lib/types/product'

export async function listCategories(): Promise<Category[]> {
  const res = await apiClient.get<{ data: Category[] }>('/api/v1/categories')
  return res.data.data
}

export async function createCategory(data: { name: string; description?: string }): Promise<Category> {
  const res = await apiClient.post<{ data: Category }>('/api/v1/admin/categories', data)
  return res.data.data
}

export async function updateCategory(id: string, data: { name?: string; description?: string }): Promise<Category> {
  const res = await apiClient.put<{ data: Category }>(`/api/v1/admin/categories/${id}`, data)
  return res.data.data
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/categories/${id}`)
}
