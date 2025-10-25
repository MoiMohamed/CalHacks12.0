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

// Task Types
export interface Task extends BaseEntity {
  title: string;
  description: string;
  completed: boolean;
}

export interface TaskCreate {
  title: string;
  description: string;
  completed?: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}
