import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/api_client";
import { routinesApi } from "@/services/api";
import type {
  Routine,
  RoutineCreate,
  RoutineCreateWithSchedule,
  RoutineUpdate,
  RoutineTaskGenerationResponse,
} from "@/types/api";
import { Alert } from "react-native";

// ========== Routine Hooks ==========

export const useUserRoutines = (userId: string) => {
  return useQuery<Routine[], Error>({
    queryKey: queryKeys.userRoutines(userId),
    queryFn: () => routinesApi.getUserRoutines(userId),
    enabled: !!userId,
  });
};

export const useCategoryRoutines = (userId: string, categoryId: string) => {
  return useQuery<Routine[], Error>({
    queryKey: queryKeys.categoryRoutines(userId, categoryId),
    queryFn: () => routinesApi.getCategoryRoutines(userId, categoryId),
    enabled: !!userId && !!categoryId,
  });
};

export const useDayRoutines = (userId: string, dayOfWeek: string) => {
  return useQuery<Routine[], Error>({
    queryKey: queryKeys.dayRoutines(userId, dayOfWeek),
    queryFn: () => routinesApi.getRoutinesForDay(userId, dayOfWeek),
    enabled: !!userId && !!dayOfWeek,
  });
};

export const useRoutine = (id: string) => {
  return useQuery<Routine, Error>({
    queryKey: queryKeys.routine(id),
    queryFn: () => routinesApi.getRoutine(id),
    enabled: !!id,
  });
};

export const useCreateRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation<Routine, Error, RoutineCreate>({
    mutationFn: routinesApi.createRoutine,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userRoutines(data.user_id),
      });
    },
    onError: (error) => {
      Alert.alert("Error creating routine", error.message);
    },
  });
};

export const useCreateRoutineWithSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation<Routine, Error, RoutineCreateWithSchedule>({
    mutationFn: routinesApi.createRoutineWithSchedule,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userRoutines(data.user_id),
      });
    },
    onError: (error) => {
      Alert.alert("Error creating routine with schedule", error.message);
    },
  });
};

export const useUpdateRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation<Routine, Error, { id: string; data: RoutineUpdate }>({
    mutationFn: ({ id, data }) => routinesApi.updateRoutine(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines });
      queryClient.invalidateQueries({
        queryKey: queryKeys.routine(variables.id),
      });
    },
    onError: (error) => {
      Alert.alert("Error updating routine", error.message);
    },
  });
};

export const useDeleteRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: routinesApi.deleteRoutine,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines });
      queryClient.removeQueries({ queryKey: queryKeys.routine(id) });
    },
    onError: (error) => {
      Alert.alert("Error deleting routine", error.message);
    },
  });
};

export const useGenerateRoutineTasks = () => {
  return useMutation<
    RoutineTaskGenerationResponse,
    Error,
    { routineId: string; days: number }
  >({
    mutationFn: ({ routineId, days }) =>
      routinesApi.generateRoutineTasks(routineId, days),
    onError: (error) => {
      Alert.alert("Error generating routine tasks", error.message);
    },
  });
};
