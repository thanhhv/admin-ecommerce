export type UserStatus = 'ACTIVE' | 'BANNED'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  status: UserStatus
  ordersCount: number
  createdAt: string
  updatedAt: string
}

export interface UserFilters {
  page?: number
  limit?: number
  q?: string
  status?: string
}

export interface UserListResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
