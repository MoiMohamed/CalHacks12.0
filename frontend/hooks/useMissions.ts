import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/api_client";
import { missionsApi } from "@/services/api";
import type {
  Mission,
  MissionCreate,
  MissionUpdate,
  MissionWithRelations,
} from "@/types/api";
import { Alert } from "react-native";

// ========== Mission Hooks ==========

export const useUserMissions = (userId: string) => {
  return useQuery<Mission[], Error>({
    queryKey: queryKeys.userMissions(userId),
    queryFn: () => missionsApi.getUserMissions(userId),
    enabled: !!userId,
  });
};

export const useTodayMissions = (userId: string) => {
  return useQuery<Mission[], Error>({
    queryKey: queryKeys.todayMissions(userId),
    queryFn: () => missionsApi.getTodayMissions(userId),
    enabled: !!userId,
  });
};

export const useOverdueMissions = (userId: string) => {
  return useQuery<Mission[], Error>({
    queryKey: queryKeys.overdueMissions(userId),
    queryFn: () => missionsApi.getOverdueMissions(userId),
    enabled: !!userId,
  });
};

export const useHighPriorityMissions = (userId: string) => {
  return useQuery<Mission[], Error>({
    queryKey: queryKeys.highPriorityMissions(userId),
    queryFn: () => missionsApi.getHighPriorityMissions(userId),
    enabled: !!userId,
  });
};

export const useHeavyMissions = (userId: string) => {
  return useQuery<Mission[], Error>({
    queryKey: queryKeys.heavyMissions(userId),
    queryFn: () => missionsApi.getHeavyMissions(userId),
    enabled: !!userId,
  });
};

export const useSearchMissions = (userId: string, searchTerm: string) => {
  return useQuery<Mission[], Error>({
    queryKey: ["missions", "search", userId, searchTerm],
    queryFn: () => missionsApi.searchMissions(userId, searchTerm),
    enabled: !!userId && !!searchTerm,
  });
};

export const useCategoryMissions = (userId: string, categoryId: string) => {
  return useQuery<Mission[], Error>({
    queryKey: queryKeys.categoryMissions(userId, categoryId),
    queryFn: () => missionsApi.getCategoryMissions(userId, categoryId),
    enabled: !!userId && !!categoryId,
  });
};

export const useTypeMissions = (userId: string, missionType: string) => {
  return useQuery<Mission[], Error>({
    queryKey: queryKeys.typeMissions(userId, missionType),
    queryFn: () => missionsApi.getTypeMissions(userId, missionType),
    enabled: !!userId && !!missionType,
  });
};

export const useSubTasks = (userId: string, parentProjectId: string) => {
  return useQuery<Mission[], Error>({
    queryKey: queryKeys.subTasks(userId, parentProjectId),
    queryFn: () => missionsApi.getSubTasks(userId, parentProjectId),
    enabled: !!userId && !!parentProjectId,
  });
};

export const useRoutineMissions = (userId: string, routineId: string) => {
  return useQuery<Mission[], Error>({
    queryKey: queryKeys.routineMissions(userId, routineId),
    queryFn: () => missionsApi.getRoutineMissions(userId, routineId),
    enabled: !!userId && !!routineId,
  });
};

export const useMission = (id: string) => {
  return useQuery<Mission, Error>({
    queryKey: queryKeys.mission(id),
    queryFn: () => missionsApi.getMission(id),
    enabled: !!id,
  });
};

export const useMissionWithRelations = (id: string) => {
  return useQuery<MissionWithRelations, Error>({
    queryKey: ["missions", id, "with-relations"],
    queryFn: () => missionsApi.getMissionWithRelations(id),
    enabled: !!id,
  });
};

export const useCreateMission = () => {
  const queryClient = useQueryClient();
  return useMutation<Mission, Error, MissionCreate>({
    mutationFn: missionsApi.createMission,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userMissions(data.user_id),
      });
    },
    onError: (error) => {
      Alert.alert("Error creating mission", error.message);
    },
  });
};

export const useUpdateMission = () => {
  const queryClient = useQueryClient();
  return useMutation<Mission, Error, { id: string; data: MissionUpdate }>({
    mutationFn: ({ id, data }) => missionsApi.updateMission(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions });
      queryClient.invalidateQueries({
        queryKey: queryKeys.mission(variables.id),
      });
    },
    onError: (error) => {
      Alert.alert("Error updating mission", error.message);
    },
  });
};

export const useCompleteMission = () => {
  const queryClient = useQueryClient();
  return useMutation<Mission, Error, string>({
    mutationFn: missionsApi.completeMission,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions });
      queryClient.invalidateQueries({ queryKey: queryKeys.mission(id) });
    },
    onError: (error) => {
      Alert.alert("Error completing mission", error.message);
    },
  });
};

export const useBreakDownMission = () => {
  const queryClient = useQueryClient();
  return useMutation<Mission[], Error, { id: string; subtaskTitles: string[] }>(
    {
      mutationFn: ({ id, subtaskTitles }) =>
        missionsApi.breakDownMission(id, subtaskTitles),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.missions });
        queryClient.invalidateQueries({
          queryKey: queryKeys.mission(variables.id),
        });
      },
      onError: (error) => {
        Alert.alert("Error breaking down mission", error.message);
      },
    }
  );
};

export const useAIContext = (userId: string) => {
  return useQuery<any, Error>({
    queryKey: ["missions", "ai-context", userId],
    queryFn: () => missionsApi.getAIContext(userId),
    enabled: !!userId,
  });
};

export const useDeleteMission = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: missionsApi.deleteMission,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions });
      queryClient.removeQueries({ queryKey: queryKeys.mission(id) });
    },
    onError: (error) => {
      Alert.alert("Error deleting mission", error.message);
    },
  });
};
