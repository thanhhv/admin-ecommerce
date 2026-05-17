export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'
export type PaymentMethod = 'COD' | 'BANK_TRANSFER'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED'

export interface OrderItem {
  id: string
  productId: string | null
  productName: string
  productImage: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Order {
  id: string
  userId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string | null
  items?: OrderItem[]
  itemCount?: number
  subtotal?: number
  shippingFee?: number
  total: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus?: PaymentStatus
  shippingName?: string
  shippingPhone?: string
  shippingAddress?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface OrderFilters {
  page?: number
  limit?: number
  status?: string
  from?: string
  to?: string
  q?: string
}

export interface OrderListResponse {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
