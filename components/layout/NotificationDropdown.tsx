'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, ExternalLink, PackageCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime, formatDate } from '@/lib/utils/formatDate'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { useUnreadCount, useNotifications, useMarkRead, useMarkAllRead } from '@/lib/hooks/useNotifications'
import type { Notification } from '@/lib/types/notification'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// ---- Notification detail dialog ----

interface DetailDialogProps {
  notification: Notification | null
  onClose: () => void
}

function NotificationDetailDialog({ notification, onClose }: DetailDialogProps) {
  const router = useRouter()
  if (!notification) return null

  const handleViewOrder = () => {
    if (notification.refId) {
      router.push(`/orders/${notification.refId}`)
    }
    onClose()
  }

  return (
    <Dialog open={!!notification} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-primary shrink-0" />
            {notification.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">{notification.body}</p>

          {notification.refId && (
            <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Mã đơn hàng</span>
                <span className="font-mono font-medium">
                  #{notification.refId.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {formatDate(notification.createdAt)}
          </p>
        </div>

        {notification.refId && (
          <div className="-mx-4 -mb-4 flex justify-end gap-2 rounded-b-xl border-t bg-muted/50 px-4 py-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
            <Button size="sm" onClick={handleViewOrder} className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Xem đơn hàng
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ---- Single notification row ----

interface NotificationRowProps {
  notification: Notification
  onClick: (n: Notification) => void
}

function NotificationRow({ notification, onClick }: NotificationRowProps) {
  return (
    <button
      className={cn(
        'w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3 items-start',
        !notification.isRead && 'bg-primary/5',
      )}
      onClick={() => onClick(notification)}
    >
      {/* unread indicator */}
      <span
        className={cn(
          'mt-1.5 h-2 w-2 shrink-0 rounded-full transition-colors',
          notification.isRead ? 'bg-transparent' : 'bg-primary',
        )}
      />
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm leading-snug', !notification.isRead && 'font-medium')}>
          {notification.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{notification.body}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </button>
  )
}

// ---- Main dropdown ----

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Notification | null>(null)

  const { data: unreadCount = 0 } = useUnreadCount()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const allNotifications = data?.pages.flatMap((p) => p.data) ?? []

  function handleNotificationClick(n: Notification) {
    setSelected(n)
    setOpen(false)
    if (!n.isRead) {
      markRead.mutate(n.id)
    }
  }

  function handleMarkAllRead() {
    markAllRead.mutate()
  }

  return (
    <>
      {/* Trigger */}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative rounded-lg p-2 hover:bg-muted transition-colors"
          aria-label="Thông báo"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
          )}
        </button>

        {/* Dropdown panel */}
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-background shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Thông báo</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={markAllRead.isPending}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[360px] overflow-y-auto divide-y">
                {allNotifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                    <Bell className="h-8 w-8 opacity-30" />
                    <p className="text-sm">Không có thông báo nào</p>
                  </div>
                ) : (
                  allNotifications.map((n) => (
                    <NotificationRow key={n.id} notification={n} onClick={handleNotificationClick} />
                  ))
                )}
              </div>

              {/* Load more */}
              {hasNextPage && (
                <div className="border-t px-4 py-2.5 text-center">
                  <button
                    onClick={() => void fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-xs text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
                  >
                    {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Detail dialog */}
      <NotificationDetailDialog
        notification={selected}
        onClose={() => setSelected(null)}
      />
    </>
  )
}
