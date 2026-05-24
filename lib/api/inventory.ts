import apiClient from './client'
import type { Pagination } from '@/lib/types/common'

export interface InventoryItem {
  productId: string
  productName: string
  productImage?: string
  category?: string
  stock: number
  lastAdjustedAt?: string
}

export interface InventoryHistoryItem {
  id: string
  productId: string
  quantityChange: number
  reason: string
  adminName: string
  createdAt: string
}

interface InventoryListData {
  items: InventoryItem[]
  pagination: Pagination
}

interface InventoryHistoryData {
  history: InventoryHistoryItem[]
  pagination: Pagination
}

export interface InventoryFilters {
  page?: number
  limit?: number
  search?: string
}

export async function listInventory(filters: InventoryFilters): Promise<InventoryListData> {
  const params: Record<string, string | number> = {}
  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit
  if (filters.search) params.search = filters.search

  // API envelope: { success, data: InventoryItem[], pagination: {...} }
  const res = await apiClient.get<{ data: InventoryItem[]; pagination: Pagination }>(
    '/api/v1/admin/inventory',
    { params },
  )
  return {
    items: res.data.data,
    pagination: res.data.pagination,
  }
}

export async function adjustInventory(
  productId: string,
  data: { quantityChange: number; reason: string }
): Promise<void> {
  await apiClient.put(`/api/v1/admin/inventory/${productId}/adjust`, data)
}

export async function getInventoryHistory(
  productId: string,
  params?: { page?: number; limit?: number }
): Promise<InventoryHistoryData> {
  // API envelope: { success, data: InventoryHistoryItem[], pagination: {...} }
  const res = await apiClient.get<{ data: InventoryHistoryItem[]; pagination: Pagination }>(
    `/api/v1/admin/inventory/${productId}/history`,
    { params },
  )
  return {
    history: res.data.data,
    pagination: res.data.pagination,
  }
}
