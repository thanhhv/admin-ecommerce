'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import { SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { StockAdjustmentDialog } from '@/components/inventory/StockAdjustmentDialog'
import { useInventory } from '@/lib/hooks/useInventory'
import { formatDate } from '@/lib/utils/formatDate'
import type { InventoryItem } from '@/lib/api/inventory'
import { cn } from '@/lib/utils'

function InventoryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null)
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '')

  const filters = {
    page: Number(searchParams.get('page') ?? 1),
    limit: 20,
    search: searchParams.get('search') ?? undefined,
  }

  const { data, isLoading } = useInventory(filters)

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: 'productName',
      header: 'Sản phẩm',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.productImage ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-md border shrink-0">
              <Image src={row.original.productImage} alt={row.original.productName} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-md border bg-muted" />
          )}
          <span className="font-medium">{row.original.productName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Danh mục',
      cell: ({ row }) => row.original.category ?? '—',
    },
    {
      accessorKey: 'stock',
      header: 'Tồn kho',
      cell: ({ row }) => (
        <span
          className={cn(
            'font-bold text-base',
            row.original.stock === 0
              ? 'text-red-600'
              : row.original.stock <= 10
                ? 'text-red-500'
                : ''
          )}
        >
          {row.original.stock}
        </span>
      ),
    },
    {
      accessorKey: 'lastAdjustedAt',
      header: 'Điều chỉnh lần cuối',
      cell: ({ row }) =>
        row.original.lastAdjustedAt ? formatDate(row.original.lastAdjustedAt) : '—',
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdjustItem(row.original)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Điều chỉnh
        </Button>
      ),
    },
  ]

  const items = data?.items ?? []
  const pagination = data?.pagination

  const handleSearch = (value: string) => {
    setSearchValue(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kho hàng"
        description="Quản lý tồn kho sản phẩm"
      />

      <div className="flex gap-3">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          className="max-w-xs"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        emptyMessage="Không có sản phẩm nào"
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

      {adjustItem && (
        <StockAdjustmentDialog
          open={!!adjustItem}
          onOpenChange={(open) => !open && setAdjustItem(null)}
          productId={adjustItem.productId}
          productName={adjustItem.productName}
          currentStock={adjustItem.stock}
        />
      )}
    </div>
  )
}

export default function InventoryPage() {
  return (
    <Suspense>
      <InventoryContent />
    </Suspense>
  )
}
