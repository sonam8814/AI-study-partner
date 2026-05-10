export interface ApiErrorShape {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ApiErrorResponse {
  error: ApiErrorShape
  request_id: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
}
