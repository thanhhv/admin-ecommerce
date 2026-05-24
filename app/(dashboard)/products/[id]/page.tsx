'use client'

import Link from 'next/link'
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
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Không tìm thấy sản phẩm.</p>
        <Link href="/products" className="text-primary text-sm underline">
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title={`Chỉnh sửa: ${product.name}`} />
      <ProductForm mode="edit" product={product} />
    </div>
  )
}
