export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  pagination: Pagination | null
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details: string[]
  }
}
