// Base API Response Types
export type ApiResponse<T> = {
  data: T;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: {
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
  };
};

// Base Entity Types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}
