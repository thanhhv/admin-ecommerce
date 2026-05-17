import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductImages,
} from '@/lib/api/products'
import type { ProductFilters, CreateProductDto, UpdateProductDto } from '@/lib/types/product'

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: () => listProducts(filters),
    staleTime: 1000 * 60,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['admin', 'products', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateProductDto & { images?: string[] }) => createProduct(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('Tạo sản phẩm thành công')
    },
    onError: () => toast.error('Tạo sản phẩm thất bại'),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) => updateProduct(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('Cập nhật sản phẩm thành công')
    },
    onError: () => toast.error('Cập nhật sản phẩm thất bại'),
  })
}

export function useSetProductImages() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, urls }: { id: string; urls: string[] }) => setProductImages(id, urls),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
    onError: () => toast.error('Cập nhật ảnh thất bại'),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('Xóa sản phẩm thành công')
    },
    onError: () => toast.error('Xóa sản phẩm thất bại'),
  })
}

export function useToggleProductStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateProduct(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
    onError: () => toast.error('Cập nhật trạng thái thất bại'),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => import('@/lib/api/categories').then((m) => m.listCategories()),
    staleTime: 1000 * 60 * 5,
  })
}
