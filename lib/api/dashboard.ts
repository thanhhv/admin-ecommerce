import apiClient from './client'
import type { Order } from '@/lib/types/order'

export interface DashboardStats {
  totalRevenue: number
  totalRevenueThisMonth: number
  revenueChangePercent: number
  ordersToday: number
  totalActiveProducts: number
  lowStockAlerts: number
  lowStockProducts: { id: string; name: string; slug: string; stock: number }[]
  totalUsers: number
  recentOrders: Order[]
}

export async function getStats(): Promise<DashboardStats> {
  const res = await apiClient.get<{ data: DashboardStats }>('/api/v1/admin/dashboard/stats')
  return res.data.data
}

export interface RevenuePoint {
  date: string
  revenue: number
}

export async function getRevenue(days: number): Promise<RevenuePoint[]> {
  const res = await apiClient.get<{ data: RevenuePoint[] }>('/api/v1/admin/dashboard/revenue', {
    params: { days },
  })
  return res.data.data
}
