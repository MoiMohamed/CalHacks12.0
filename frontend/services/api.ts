import { apiClient, queryKeys } from "./api_client";
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  ApiResponse,
  PaginatedResponse,
  // Neuri types
  User,
  UserCreate,
  UserUpdate,
  UserProfileSetup,
  Category,
  CategoryCreate,
  CategoryUpdate,
  Routine,
  RoutineCreate,
  RoutineCreateWithSchedule,
  RoutineUpdate,
  Mission,
  MissionCreate,
  MissionUpdate,
  MissionWithRelations,
  Reward,
  DashboardStats,
  RoutineTaskGenerationResponse,
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

// ========== Users API ==========
export const usersApi = {
  // Create a new user
  createUser: async (userData: UserCreate): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      "/users/",
      userData
    );
    return response.data.data;
  },

  // Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<PaginatedResponse<User>>("/users/");
    return response.data.data || [];
  },

  // Get a single user by ID
  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  // Update user profile
  updateUser: async (id: string, userData: UserUpdate): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `/users/${id}`,
      userData
    );
    return response.data.data;
  },

  // Setup user profile during onboarding
  setupUserProfile: async (
    id: string,
    profileData: UserProfileSetup
  ): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      `/users/${id}/setup-profile`,
      profileData
    );
    return response.data.data;
  },

  // Delete user account
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

// ========== Categories API ==========
export const categoriesApi = {
  // Create a new category
  createCategory: async (categoryData: CategoryCreate): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>(
      "/categories/",
      categoryData
    );
    return response.data.data;
  },

  // List categories for a user
  getUserCategories: async (userId: string): Promise<Category[]> => {
    const response = await apiClient.get<PaginatedResponse<Category>>(
      `/categories/user/${userId}`
    );
    return response.data.data || [];
  },

  // Get a single category by ID
  getCategory: async (id: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(
      `/categories/${id}`
    );
    return response.data.data;
  },

  // Update category
  updateCategory: async (
    id: string,
    categoryData: CategoryUpdate
  ): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(
      `/categories/${id}`,
      categoryData
    );
    return response.data.data;
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  // Get or create category
  getOrCreateCategory: async (
    userId: string,
    categoryName: string
  ): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>(
      "/categories/get-or-create",
      {
        user_id: userId,
        category_name: categoryName,
      }
    );
    return response.data.data;
  },
};

// ========== Routines API ==========
export const routinesApi = {
  // Create a new routine
  createRoutine: async (routineData: RoutineCreate): Promise<Routine> => {
    const response = await apiClient.post<ApiResponse<Routine>>(
      "/routines/",
      routineData
    );
    return response.data.data;
  },

  // Create a routine with schedule
  createRoutineWithSchedule: async (
    routineData: RoutineCreateWithSchedule
  ): Promise<Routine> => {
    const response = await apiClient.post<ApiResponse<Routine>>(
      "/routines/with-schedule",
      routineData
    );
    return response.data.data;
  },

  // List routines for a user
  getUserRoutines: async (userId: string): Promise<Routine[]> => {
    const response = await apiClient.get<PaginatedResponse<Routine>>(
      `/routines/user/${userId}`
    );
    return response.data.data || [];
  },

  // List routines in a category
  getCategoryRoutines: async (
    userId: string,
    categoryId: string
  ): Promise<Routine[]> => {
    const response = await apiClient.get<PaginatedResponse<Routine>>(
      `/routines/user/${userId}/category/${categoryId}`
    );
    return response.data.data || [];
  },

  // Get routines for a specific day
  getRoutinesForDay: async (
    userId: string,
    dayOfWeek: string
  ): Promise<Routine[]> => {
    const response = await apiClient.get<PaginatedResponse<Routine>>(
      `/routines/user/${userId}/day/${dayOfWeek}`
    );
    return response.data.data || [];
  },

  // Get a single routine by ID
  getRoutine: async (id: string): Promise<Routine> => {
    const response = await apiClient.get<ApiResponse<Routine>>(
      `/routines/${id}`
    );
    return response.data.data;
  },

  // Update routine
  updateRoutine: async (
    id: string,
    routineData: RoutineUpdate
  ): Promise<Routine> => {
    const response = await apiClient.put<ApiResponse<Routine>>(
      `/routines/${id}`,
      routineData
    );
    return response.data.data;
  },

  // Delete routine
  deleteRoutine: async (id: string): Promise<void> => {
    await apiClient.delete(`/routines/${id}`);
  },

  // Generate tasks for a routine over N days
  generateRoutineTasks: async (
    routineId: string,
    days: number
  ): Promise<RoutineTaskGenerationResponse> => {
    const response = await apiClient.post<
      ApiResponse<RoutineTaskGenerationResponse>
    >(`/routines/${routineId}/generate-tasks?days=${days}`);
    return response.data.data;
  },
};

// ========== Missions API ==========
export const missionsApi = {
  // Create a new mission
  createMission: async (missionData: MissionCreate): Promise<Mission> => {
    const response = await apiClient.post<ApiResponse<Mission>>(
      "/missions/",
      missionData
    );
    return response.data.data;
  },

  // List missions for a user
  getUserMissions: async (userId: string): Promise<Mission[]> => {
    const response = await apiClient.get<PaginatedResponse<Mission>>(
      `/missions/user/${userId}`
    );
    return response.data.data || [];
  },

  // Get missions due today
  getTodayMissions: async (userId: string): Promise<Mission[]> => {
    const response = await apiClient.get<PaginatedResponse<Mission>>(
      `/missions/user/${userId}/today`
    );
    return response.data.data || [];
  },

  // Get overdue missions
  getOverdueMissions: async (userId: string): Promise<Mission[]> => {
    const response = await apiClient.get<PaginatedResponse<Mission>>(
      `/missions/user/${userId}/overdue`
    );
    return response.data.data || [];
  },

  // Get high priority missions
  getHighPriorityMissions: async (userId: string): Promise<Mission[]> => {
    const response = await apiClient.get<PaginatedResponse<Mission>>(
      `/missions/user/${userId}/high-priority`
    );
    return response.data.data || [];
  },

  // Get heavy missions
  getHeavyMissions: async (userId: string): Promise<Mission[]> => {
    const response = await apiClient.get<PaginatedResponse<Mission>>(
      `/missions/user/${userId}/heavy`
    );
    return response.data.data || [];
  },

  // Search missions by title
  searchMissions: async (
    userId: string,
    searchTerm: string
  ): Promise<Mission[]> => {
    const response = await apiClient.get<PaginatedResponse<Mission>>(
      `/missions/user/${userId}/search?search_term=${searchTerm}`
    );
    return response.data.data || [];
  },

  // List missions in a category
  getCategoryMissions: async (
    userId: string,
    categoryId: string
  ): Promise<Mission[]> => {
    const response = await apiClient.get<PaginatedResponse<Mission>>(
      `/missions/user/${userId}/category/${categoryId}`
    );
    return response.data.data || [];
  },

  // List missions by type
  getTypeMissions: async (
    userId: string,
    missionType: string
  ): Promise<Mission[]> => {
    const response = await apiClient.get<PaginatedResponse<Mission>>(
      `/missions/user/${userId}/type/${missionType}`
    );
    return response.data.data || [];
  },

  // List sub-tasks for a project
  getSubTasks: async (
    userId: string,
    parentProjectId: string
  ): Promise<Mission[]> => {
    const response = await apiClient.get<PaginatedResponse<Mission>>(
      `/missions/user/${userId}/subtasks/${parentProjectId}`
    );
    return response.data.data || [];
  },

  // List missions generated by a routine
  getRoutineMissions: async (
    userId: string,
    routineId: string
  ): Promise<Mission[]> => {
    const response = await apiClient.get<PaginatedResponse<Mission>>(
      `/missions/user/${userId}/routine/${routineId}`
    );
    return response.data.data || [];
  },

  // Get a single mission by ID
  getMission: async (id: string): Promise<Mission> => {
    const response = await apiClient.get<ApiResponse<Mission>>(
      `/missions/${id}`
    );
    return response.data.data;
  },

  // Get mission with relations
  getMissionWithRelations: async (
    id: string
  ): Promise<MissionWithRelations> => {
    const response = await apiClient.get<ApiResponse<MissionWithRelations>>(
      `/missions/${id}/with-relations`
    );
    return response.data.data;
  },

  // Update mission
  updateMission: async (
    id: string,
    missionData: MissionUpdate
  ): Promise<Mission> => {
    const response = await apiClient.put<ApiResponse<Mission>>(
      `/missions/${id}`,
      missionData
    );
    return response.data.data;
  },

  // Complete mission
  completeMission: async (id: string): Promise<Mission> => {
    const response = await apiClient.patch<ApiResponse<Mission>>(
      `/missions/${id}/complete`
    );
    return response.data.data;
  },

  // Break down a heavy mission into subtasks
  breakDownMission: async (
    id: string,
    subtaskTitles: string[]
  ): Promise<Mission[]> => {
    const response = await apiClient.post<PaginatedResponse<Mission>>(
      `/missions/${id}/break-down`,
      subtaskTitles
    );
    return response.data.data || [];
  },

  // Get context for AI agent
  getAIContext: async (userId: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/missions/user/${userId}/ai-context`
    );
    return response.data.data;
  },

  // Delete mission
  deleteMission: async (id: string): Promise<void> => {
    await apiClient.delete(`/missions/${id}`);
  },
};

// ========== Rewards API ==========
export const rewardsApi = {
  // Get user's reward profile
  getUserReward: async (userId: string): Promise<Reward> => {
    const response = await apiClient.get<ApiResponse<Reward>>(
      `/rewards/user/${userId}`
    );
    return response.data.data;
  },

  // Add points for completing a mission
  addMissionPoints: async (
    userId: string,
    missionType: string,
    isSubtask: boolean = false
  ): Promise<Reward> => {
    const response = await apiClient.post<ApiResponse<Reward>>(
      `/rewards/user/${userId}/add-mission-points`,
      {
        mission_type: missionType,
        is_subtask: isSubtask,
      }
    );
    return response.data.data;
  },

  // Update user's streak
  updateUserStreak: async (
    userId: string,
    streakChange: number
  ): Promise<Reward> => {
    const response = await apiClient.patch<ApiResponse<Reward>>(
      `/rewards/user/${userId}/update-streak`,
      {
        streak_change: streakChange,
      }
    );
    return response.data.data;
  },

  // Get tree progress information
  getTreeProgress: async (userId: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/rewards/user/${userId}/tree-progress`
    );
    return response.data.data;
  },

  // Get dashboard statistics
  getDashboardStats: async (userId: string): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      `/rewards/user/${userId}/dashboard-stats`
    );
    return response.data.data;
  },
};

// ========== Query Keys (re-export for convenience) ==========
export { queryKeys };

// ========== Default exports ==========
export default {};
