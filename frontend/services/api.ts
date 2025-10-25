import { apiClient, queryKeys } from "./api_client";
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  ApiResponse,
  PaginatedResponse,
} from "../types/api";

export const heathApi = {
  getHealth: async (): Promise<any> => {
    const response = await apiClient.get("/healthcheck");
    return response.data;
  },
};

export const tasksApi = {
  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    const response = await apiClient.get<PaginatedResponse<Task>>("/tasks/");
    return response.data.data || [];
  },

  // Get a single task by ID
  getTask: async (id: string): Promise<Task> => {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  },

  // Create a new task
  createTask: async (taskData: TaskCreate): Promise<Task> => {
    const response = await apiClient.post<ApiResponse<Task>>(
      "/tasks/",
      taskData
    );
    return response.data.data;
  },

  // Update a task
  updateTask: async (id: string, taskData: TaskUpdate): Promise<Task> => {
    const response = await apiClient.put<ApiResponse<Task>>(
      `/tasks/${id}`,
      taskData
    );
    return response.data.data;
  },

  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

// ========== Query Keys (re-export for convenience) ==========
export { queryKeys };

// ========== Default exports ==========
export default {};
