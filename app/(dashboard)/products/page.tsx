'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ProductFilters } from '@/components/products/ProductFilters'
import {
  useProducts,
  useDeleteProduct,
  useToggleProductStatus,
  useCategories,
} from '@/lib/hooks/useProducts'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { Product } from '@/lib/types/product'
import { useState } from 'react'
import { cn } from '@/lib/utils'

function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = {
    page: Number(searchParams.get('page') ?? 1),
    limit: 20,
    search: searchParams.get('search') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    isActive: searchParams.get('isActive') ?? undefined,
  }

  const { data, isLoading } = useProducts(filters)
  const { data: categoriesData } = useCategories()
  const deleteProduct = useDeleteProduct()
  const toggleStatus = useToggleProductStatus()

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'primaryImageUrl',
      header: 'Ảnh',
      cell: ({ row }) => {
        const src = row.original.primaryImageUrl ?? row.original.images?.[0]
        return src ? (
          <div className="relative h-10 w-10 overflow-hidden rounded-md border">
            <Image
              src={src}
              alt={row.original.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-md border bg-muted" />
        )
      },
    },
    {
      accessorKey: 'name',
      header: 'Tên sản phẩm',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.brand}</p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Danh mục',
      cell: ({ row }) => row.original.category?.name ?? '—',
    },
    {
      accessorKey: 'basePrice',
      header: 'Giá gốc',
      cell: ({ row }) => formatCurrency(row.original.basePrice),
    },
    {
      accessorKey: 'salePrice',
      header: 'Giá KM',
      cell: ({ row }) =>
        row.original.salePrice ? formatCurrency(row.original.salePrice) : '—',
    },
    {
      accessorKey: 'stock',
      header: 'Tồn kho',
      cell: ({ row }) => (
        <span
          className={cn(
            'font-medium',
            row.original.stock <= 5 ? 'text-red-600' : row.original.stock <= 10 ? 'text-yellow-600' : ''
          )}
        >
          {row.original.stock}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={(checked) =>
            toggleStatus.mutate({ id: row.original.id, isActive: checked })
          }
        />
      ),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/products/${row.original.id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteProduct.mutateAsync(deleteId)
      setDeleteId(null)
    } catch {
      toast.error('Xóa sản phẩm thất bại')
    }
  }

  const products = data?.products ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sản phẩm"
        description="Quản lý danh sách sản phẩm"
        action={
          <Button onClick={() => router.push('/products/new')}>
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        }
      />

      <ProductFilters categories={categoriesData ?? []} />

      <DataTable
        columns={columns}
        data={products}
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

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xóa sản phẩm"
        description="Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này không thể hoàn tác."
        confirmLabel="Xóa"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  )
}
