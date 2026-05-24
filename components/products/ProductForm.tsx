'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductImageManager } from './ProductImageManager'
import { useCreateProduct, useUpdateProduct, useSetProductImages, useCategories } from '@/lib/hooks/useProducts'
import type { Product } from '@/lib/types/product'

const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  slug: z.string().optional(),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  basePrice: z.number().min(1000, 'Giá gốc tối thiểu 1,000 VND'),
  salePrice: z.number().optional(),
  stock: z.number().min(0, 'Tồn kho không được âm'),
  brand: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

type FormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
  mode: 'create' | 'edit'
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter()
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const setImages = useSetProductImages()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      categoryId: product?.categoryId ?? '',
      basePrice: product?.basePrice ?? 0,
      salePrice: product?.salePrice,
      stock: product?.stock ?? 0,
      brand: product?.brand ?? '',
      description: product?.description ?? '',
      images: product?.images ?? [],
      isActive: product?.isActive ?? true,
    },
  })

  const images = watch('images') ?? []
  const nameValue = watch('name')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    if (!slugManuallyEdited && nameValue) {
      const timer = setTimeout(() => {
        const autoSlug = nameValue
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
        setValue('slug', autoSlug)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [nameValue, slugManuallyEdited, setValue])

  const onSubmit = async (data: FormValues) => {
    try {
      if (mode === 'create') {
        await createProduct.mutateAsync({
          name: data.name,
          slug: data.slug,
          categoryId: data.categoryId,
          basePrice: data.basePrice,
          salePrice: data.salePrice,
          stock: data.stock,
          brand: data.brand,
          description: data.description,
          images: data.images,
          isActive: data.isActive,
        })
        router.push('/products')
      } else if (product) {
        await updateProduct.mutateAsync({
          id: product.id,
          dto: {
            name: data.name,
            slug: data.slug,
            categoryId: data.categoryId,
            basePrice: data.basePrice,
            salePrice: data.salePrice,
            stock: data.stock,
            brand: data.brand,
            description: data.description,
            isActive: data.isActive,
          },
        })
        await setImages.mutateAsync({ id: product.id, urls: data.images ?? [] })
      }
    } catch {
      // error toasts are handled by each hook's onError; catch here to prevent unhandled rejection
    }
  }

  const isPending = createProduct.isPending || updateProduct.isPending || setImages.isPending
  const categories = categoriesData ?? []

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên sản phẩm <span className="text-red-500">*</span></Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              {...register('slug', { onChange: () => setSlugManuallyEdited(true) })}
              placeholder="tu-dong-tao-tu-ten-san-pham"
            />
            <p className="text-xs text-muted-foreground">Để trống để tự động tạo từ tên sản phẩm</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Thương hiệu</Label>
            <Input id="brand" {...register('brand')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Danh mục <span className="text-red-500">*</span></Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v ?? '')}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? 'Đang tải...' : 'Chọn danh mục'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" rows={4} {...register('description')} />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Giá bán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Giá gốc (VND) <span className="text-red-500">*</span></Label>
              <Controller
                name="basePrice"
                control={control}
                render={({ field }) => (
                  <Input
                    id="basePrice"
                    value={field.value ? field.value.toLocaleString('en-US') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '')
                      field.onChange(raw ? Number(raw) : 0)
                    }}
                    onBlur={field.onBlur}
                    placeholder="0"
                  />
                )}
              />
              {errors.basePrice && (
                <p className="text-sm text-destructive">{errors.basePrice.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePrice">Giá khuyến mãi (VND)</Label>
              <Controller
                name="salePrice"
                control={control}
                render={({ field }) => (
                  <Input
                    id="salePrice"
                    value={field.value ? field.value.toLocaleString('en-US') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '')
                      field.onChange(raw ? Number(raw) : undefined)
                    }}
                    onBlur={field.onBlur}
                    placeholder="Để trống nếu không giảm giá"
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Kho hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="stock">Số lượng tồn kho <span className="text-red-500">*</span></Label>
            <Input id="stock" type="number" className="w-48" {...register('stock', { valueAsNumber: true })} />
            {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Hình ảnh</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductImageManager
            images={images}
            onChange={(imgs) => setValue('images', imgs)}
          />
        </CardContent>
      </Card>

      {/* Status (edit only) */}
      {mode === 'edit' && (
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <Switch
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">
                    {field.value ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                </div>
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {mode === 'create' ? 'Đang tạo...' : 'Đang lưu...'}
            </span>
          ) : mode === 'create' ? (
            'Tạo sản phẩm'
          ) : (
            'Lưu thay đổi'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/products')}>
          Hủy
        </Button>
      </div>
    </form>
  )
}
