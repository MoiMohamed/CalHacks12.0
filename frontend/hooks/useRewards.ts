import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/api_client";
import { rewardsApi } from "@/services/api";
import type { Reward, DashboardStats } from "@/types/api";
import { Alert } from "react-native";

// ========== Reward Hooks ==========

export const useUserReward = (userId: string) => {
  return useQuery<Reward, Error>({
    queryKey: queryKeys.userReward(userId),
    queryFn: () => rewardsApi.getUserReward(userId),
    enabled: !!userId,
  });
};

export const useDashboardStats = (userId: string) => {
  return useQuery<DashboardStats, Error>({
    queryKey: queryKeys.dashboardStats(userId),
    queryFn: () => rewardsApi.getDashboardStats(userId),
    enabled: !!userId,
  });
};

export const useAddMissionPoints = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Reward,
    Error,
    { userId: string; missionType: string; isSubtask?: boolean }
  >({
    mutationFn: ({ userId, missionType, isSubtask = false }) =>
      rewardsApi.addMissionPoints(userId, missionType, isSubtask),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userReward(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardStats(data.user_id),
      });
    },
    onError: (error) => {
      Alert.alert("Error adding mission points", error.message);
    },
  });
};

export const useUpdateUserStreak = () => {
  const queryClient = useQueryClient();
  return useMutation<Reward, Error, { userId: string; streakChange: number }>({
    mutationFn: ({ userId, streakChange }) =>
      rewardsApi.updateUserStreak(userId, streakChange),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userReward(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardStats(data.user_id),
      });
    },
    onError: (error) => {
      Alert.alert("Error updating streak", error.message);
    },
  });
};
