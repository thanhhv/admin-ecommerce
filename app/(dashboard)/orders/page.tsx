'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import { Download, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { OrderFilters } from '@/components/orders/OrderFilters'
import { useOrders } from '@/lib/hooks/useOrders'
import { exportOrders } from '@/lib/api/orders'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { formatDate } from '@/lib/utils/formatDate'
import type { Order } from '@/lib/types/order'

function OrdersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters = {
    page: Number(searchParams.get('page') ?? 1),
    limit: 20,
    status: searchParams.get('status') ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    q: searchParams.get('q') ?? undefined,
  }

  const { data, isLoading } = useOrders(filters)

  const handleExport = async () => {
    try {
      const blob = await exportOrders()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Xuất CSV thất bại')
    }
  }

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: 'Mã đơn',
      cell: ({ row }) => (
        <Link
          href={`/orders/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          #{row.original.id.slice(-8).toUpperCase()}
        </Link>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Khách hàng',
    },
    {
      accessorKey: 'itemCount',
      header: 'Số SP',
      cell: ({ row }) => `${row.original.itemCount ?? row.original.items?.length ?? 0} sản phẩm`,
    },
    {
      accessorKey: 'total',
      header: 'Tổng tiền',
      cell: ({ row }) => (
        <span className="font-semibold">{formatCurrency(row.original.total)}</span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Thanh toán',
      cell: ({ row }) => <StatusBadge status={row.original.paymentMethod} />,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: 'Chi tiết',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/orders/${row.original.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const orders = data?.orders ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-4">
      <PageHeader
        title="Đơn hàng"
        description="Quản lý đơn hàng"
        action={
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Xuất CSV
          </Button>
        }
      />

      <OrderFilters />

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyMessage="Không có đơn hàng nào"
      />

      {pagination && (
        <div className="flex justify-end">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => {
              const params = new URLSearchParams(searchParams.toString())
              params.set('page', String(p))
              router.push(`?${params.toString()}`)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  )
}
