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

// Neuri System Types

// Mission Types
export type MissionType = "task" | "project" | "note" | "reminder";

export interface Mission extends BaseEntity {
  title: string;
  type: MissionType;
  user_id: string;
  category_id?: string;
  parent_project_id?: string;
  parent_routine_id?: string;
  body?: string;
  true_deadline?: string;
  personal_deadline?: string;
  recurrence_rule?: string;
  is_complete: boolean;
  heaviness?: number;
  priority?: number;
}

export interface MissionCreate {
  title: string;
  type: MissionType;
  user_id: string;
  category_id?: string;
  parent_project_id?: string;
  parent_routine_id?: string;
  body?: string;
  true_deadline?: string;
  personal_deadline?: string;
  recurrence_rule?: string;
  is_complete?: boolean;
  heaviness?: number;
  priority?: number;
}

export interface MissionUpdate {
  title?: string;
  type?: MissionType;
  category_id?: string;
  parent_project_id?: string;
  parent_routine_id?: string;
  body?: string;
  true_deadline?: string;
  personal_deadline?: string;
  recurrence_rule?: string;
  is_complete?: boolean;
  heaviness?: number;
  priority?: number;
}

export interface MissionWithRelations extends Mission {
  category?: Category;
  sub_tasks?: Mission[];
  parent_project?: Mission;
  parent_routine?: Routine;
}

// User Types
export interface User extends BaseEntity {
  email: string;
  name?: string;
  pace?: string;
  preferred_work_time?: string;
}

export interface UserCreate {
  id: string;
  email: string;
  name?: string;
  pace?: string;
  preferred_work_time?: string;
}

export interface UserUpdate {
  email?: string;
  name?: string;
  pace?: string;
  preferred_work_time?: string;
}

export interface UserProfileSetup {
  name: string;
  pace: string;
  preferred_work_time: string;
}

// Category Types
export interface Category extends BaseEntity {
  name: string;
  user_id: string;
}

export interface CategoryCreate {
  name: string;
  user_id: string;
}

export interface CategoryUpdate {
  name?: string;
}

// Routine Types
export interface ScheduleItem {
  day: string;
  time: string;
}

export interface Routine extends BaseEntity {
  user_id: string;
  category_id?: string;
  title: string;
  schedule?: string; // JSON string
}

export interface RoutineCreate {
  user_id: string;
  category_id?: string;
  title: string;
  schedule?: string;
}

export interface RoutineCreateWithSchedule {
  user_id: string;
  category_id?: string;
  title: string;
  schedule?: ScheduleItem[];
}

export interface RoutineUpdate {
  category_id?: string;
  title?: string;
  schedule?: string;
}

export interface RoutineScheduleRead {
  routine: Routine;
  schedule_items: ScheduleItem[];
}

// Reward Types
export interface Reward extends BaseEntity {
  user_id: string;
  points: number;
  streak: number;
  total_tasks_done: number;
  milestones_unlocked?: string;
}

export interface RewardCreate {
  user_id: string;
  points?: number;
  streak?: number;
  total_tasks_done?: number;
  milestones_unlocked?: string;
}

export interface RewardUpdate {
  points?: number;
  streak?: number;
  total_tasks_done?: number;
  milestones_unlocked?: string;
}

export interface DashboardStats {
  total_points: number;
  current_streak: number;
  total_tasks_done: number;
  milestones_unlocked?: string;
}

// Routine Task Generation Types
export interface GeneratedTask {
  title: string;
  scheduled_date: string;
  day_number: number;
  day_of_week: string;
}

export interface RoutineTaskGenerationResponse {
  routine: Routine;
  days_requested: number;
  generated_tasks: GeneratedTask[];
  total_tasks: number;
}

export interface RoutineTaskGeneration {
  routine_id: string;
  days: number;
}
