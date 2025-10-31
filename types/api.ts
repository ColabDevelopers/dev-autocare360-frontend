// types/api.ts
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}
