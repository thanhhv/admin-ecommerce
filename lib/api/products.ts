import apiClient from './client'
import type { Product, ProductFilters, CreateProductDto, UpdateProductDto } from '@/lib/types/product'
import type { Pagination } from '@/lib/types/common'

interface ProductListData {
  products: Product[]
  pagination: Pagination
}

export async function listProducts(filters: ProductFilters): Promise<ProductListData> {
  const params: Record<string, string | number> = {}
  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit
  if (filters.search) params.search = filters.search
  if (filters.categoryId) params.categoryId = filters.categoryId
  if (filters.isActive !== undefined && filters.isActive !== '') params.isActive = filters.isActive

  const res = await apiClient.get<{ data: Product[]; pagination: Pagination }>(
    '/api/v1/admin/products',
    { params },
  )
  return {
    products: res.data.data,
    pagination: res.data.pagination,
  }
}

type RawProductImage = { url: string; isPrimary?: boolean; sortOrder?: number }

export async function getProduct(id: string): Promise<Product> {
  const res = await apiClient.get<{ data: Product & { images?: (RawProductImage | string)[] } }>(
    `/api/v1/admin/products/${id}`,
  )
  const data = res.data.data
  const rawImages = data.images ?? []
  return {
    ...data,
    images: rawImages.map((img) => (typeof img === 'string' ? img : (img as RawProductImage).url)),
  }
}

export async function createProduct(dto: CreateProductDto & { images?: string[] }): Promise<Product> {
  const formData = new FormData()
  formData.append('name', dto.name)
  formData.append('categoryId', dto.categoryId)
  formData.append('basePrice', String(dto.basePrice))
  if (dto.salePrice !== undefined) formData.append('salePrice', String(dto.salePrice))
  formData.append('stock', String(dto.stock))
  if (dto.brand) formData.append('brand', dto.brand)
  if (dto.description) formData.append('description', dto.description)
  if (dto.images) {
    dto.images.forEach((url) => formData.append('imageUrls', url))
  }

  const res = await apiClient.post<{ data: Product }>('/api/v1/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

export async function setProductImages(id: string, urls: string[]): Promise<void> {
  await apiClient.put(`/api/v1/admin/products/${id}/images`, { urls })
}

export async function updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
  const res = await apiClient.put<{ data: Product }>(`/api/v1/admin/products/${id}`, dto)
  return res.data.data
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/products/${id}`)
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)
  const res = await apiClient.post<{ data: { url: string } }>('/api/v1/admin/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data.url
}
