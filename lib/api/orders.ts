import apiClient from './client'
import type { Order, OrderFilters, OrderStatus } from '@/lib/types/order'
import type { Pagination } from '@/lib/types/common'

interface OrderListData {
  orders: Order[]
  pagination: Pagination
}

export async function listOrders(filters: OrderFilters): Promise<OrderListData> {
  const params: Record<string, string | number> = {}
  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit
  if (filters.status && filters.status !== 'all') params.status = filters.status
  if (filters.from) params.from = filters.from
  if (filters.to) params.to = filters.to
  if (filters.q) params.q = filters.q
  if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod

  const res = await apiClient.get<{ data: Order[]; pagination: Pagination }>(
    '/api/v1/admin/orders',
    { params },
  )
  return {
    orders: res.data.data,
    pagination: res.data.pagination,
  }
}

export async function getOrder(id: string): Promise<Order> {
  const res = await apiClient.get<{ data: Order }>(`/api/v1/admin/orders/${id}`)
  return res.data.data
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const res = await apiClient.put<{ data: Order }>(`/api/v1/admin/orders/${id}/status`, { status })
  return res.data.data
}

export async function exportOrders(): Promise<Blob> {
  const res = await apiClient.get('/api/v1/admin/orders/export', {
    responseType: 'blob',
  })
  return res.data as Blob
}
