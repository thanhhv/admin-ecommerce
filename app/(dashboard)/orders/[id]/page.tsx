'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { OrderStatusStepper } from '@/components/orders/OrderStatusStepper'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useOrder, useUpdateOrderStatus } from '@/lib/hooks/useOrders'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { formatDate } from '@/lib/utils/formatDate'
import type { OrderStatus } from '@/lib/types/order'
import { useState } from 'react'
import Image from 'next/image'

const nextStatusMap: Record<string, { status: OrderStatus; label: string } | null> = {
  PENDING: { status: 'CONFIRMED', label: 'Xác nhận đơn hàng' },
  CONFIRMED: { status: 'SHIPPING', label: 'Bắt đầu giao hàng' },
  SHIPPING: { status: 'DELIVERED', label: 'Đã giao thành công' },
  DELIVERED: null,
  CANCELLED: null,
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: order, isLoading, isError, refetch } = useOrder(id)
  const updateStatus = useUpdateOrderStatus()
  const [cancelOpen, setCancelOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Có lỗi xảy ra khi tải đơn hàng.</p>
        <button
          onClick={() => refetch()}
          className="text-primary underline text-sm"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Không tìm thấy đơn hàng.</p>
        <a href="/orders" className="text-primary text-sm underline">
          ← Quay lại danh sách đơn hàng
        </a>
      </div>
    )
  }

  const nextAction = nextStatusMap[order.status]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Đơn hàng #${order.id.slice(-8).toUpperCase()}`}
        action={
          <Button variant="outline" onClick={() => router.push('/orders')}>
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status stepper */}
          <Card>
            <CardContent className="pt-6">
              <OrderStatusStepper currentStatus={order.status} />

              <div className="mt-4 flex gap-2">
                {nextAction && (
                  <Button
                    onClick={() =>
                      updateStatus.mutate({ id: order.id, status: nextAction.status })
                    }
                    disabled={updateStatus.isPending}
                  >
                    {nextAction.label}
                  </Button>
                )}
                {order.status === 'PENDING' && (
                  <Button variant="outline" onClick={() => setCancelOpen(true)}>
                    Hủy đơn
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order items */}
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm đã đặt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(order.items ?? []).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.productImage ? (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                        <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-md border bg-muted" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold">{formatCurrency(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatCurrency(order.subtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span>{formatCurrency(order.shippingFee ?? 0)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-1 border-t">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Customer info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Tên:</span> {order.customerName}</p>
              <p><span className="text-muted-foreground">Email:</span> {order.customerEmail}</p>
              {order.customerPhone && (
                <p><span className="text-muted-foreground">SĐT:</span> {order.customerPhone}</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping address */}
          <Card>
            <CardHeader>
              <CardTitle>Địa chỉ giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {order.shippingName || order.shippingPhone || order.shippingAddress ? (
                <>
                  {order.shippingName && <p className="font-medium">{order.shippingName}</p>}
                  {order.shippingPhone && <p>{order.shippingPhone}</p>}
                  {order.shippingAddress && <p>{order.shippingAddress}</p>}
                </>
              ) : (
                <p className="text-muted-foreground">Không có thông tin</p>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phương thức</span>
                <StatusBadge status={order.paymentMethod} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạng thái</span>
                <StatusBadge status={order.paymentStatus ?? 'PENDING'} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ngày đặt</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Hủy đơn hàng"
        description="Bạn có chắc muốn hủy đơn hàng này? Thao tác này không thể hoàn tác."
        confirmLabel="Hủy đơn"
        destructive
        isLoading={updateStatus.isPending}
        onConfirm={async () => {
          try {
            await updateStatus.mutateAsync({ id: order.id, status: 'CANCELLED' })
            setCancelOpen(false) // only close on success
            toast.success('Đã huỷ đơn hàng')
          } catch {
            toast.error('Không thể huỷ đơn hàng, vui lòng thử lại')
            // dialog stays open — do NOT call setCancelOpen(false) here
          }
        }}
      />
    </div>
  )
}
