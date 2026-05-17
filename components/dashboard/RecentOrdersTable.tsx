'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { formatRelativeTime } from '@/lib/utils/formatDate'
import type { Order } from '@/lib/types/order'

interface RecentOrdersTableProps {
  orders: Order[]
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chưa có đơn hàng</p>
        ) : (
          <div className="space-y-0 divide-y">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between py-3 hover:bg-muted/40 transition-colors rounded px-2 -mx-2"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">#{order.id.slice(-8)}</span>
                  <span className="text-xs text-muted-foreground">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
                  <StatusBadge status={order.status} />
                  <span className="text-xs text-muted-foreground hidden md:block">
                    {formatRelativeTime(order.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
