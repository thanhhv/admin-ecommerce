import apiClient from './client'
import type { NotificationListResponse } from '@/lib/types/notification'

export async function listNotifications(cursor?: string, limit = 5): Promise<NotificationListResponse> {
  const params: Record<string, string | number> = { limit }
  if (cursor) params.cursor = cursor
  const res = await apiClient.get<{ data: NotificationListResponse }>(
    '/api/v1/admin/notifications',
    { params },
  )
  return res.data.data
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient.get<{ data: { count: number } }>(
    '/api/v1/admin/notifications/unread-count',
  )
  return res.data.data.count
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(`/api/v1/admin/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch('/api/v1/admin/notifications/read-all')
}
