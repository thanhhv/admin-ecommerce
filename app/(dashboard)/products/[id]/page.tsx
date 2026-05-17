'use client'

import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProductForm } from '@/components/products/ProductForm'
import { useProduct } from '@/lib/hooks/useProducts'

export default function EditProductPage() {
  const params = useParams()
  const id = params.id as string
  const { data: product, isLoading } = useProduct(id)

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (!product) {
    return <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title={`Chỉnh sửa: ${product.name}`} />
      <ProductForm mode="edit" product={product} />
    </div>
  )
}
