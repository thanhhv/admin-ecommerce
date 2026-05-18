import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api/notifications'

export function useUnreadCount() {
  return useQuery({
    queryKey: ['admin', 'notifications', 'unread-count'],
    queryFn: getUnreadCount,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: ({ pageParam }) => listNotifications(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'notifications'] })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'notifications'] })
    },
  })
}
