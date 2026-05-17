export interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  categoryId: string
  category?: Category
  basePrice: number
  salePrice?: number
  stock: number
  brand?: string
  description?: string
  images: string[]
  primaryImageUrl?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  isActive?: string
}

export interface CreateProductDto {
  name: string
  categoryId: string
  basePrice: number
  salePrice?: number
  stock: number
  brand?: string
  description?: string
  images?: string[]
}

export interface UpdateProductDto {
  name?: string
  categoryId?: string
  basePrice?: number
  salePrice?: number
  stock?: number
  brand?: string
  description?: string
  isActive?: boolean
}

export interface ProductListResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
