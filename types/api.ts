// Shared API response shapes.

export interface ApiResponse<T> {
  data:    T | null
  error:   string | null
  success: boolean
}

export interface ApiError {
  message: string
  code?:   string
  status?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page:       number
    perPage:    number
    total:      number
    totalPages: number
  }
}
