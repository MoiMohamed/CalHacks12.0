import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/api_client";
import { usersApi } from "@/services/api";
import type {
  User,
  UserCreate,
  UserUpdate,
  UserProfileSetup,
} from "@/types/api";
import { Alert } from "react-native";

// ========== User Hooks ==========

export const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: queryKeys.users,
    queryFn: usersApi.getUsers,
  });
};

export const useUser = (id: string) => {
  return useQuery<User, Error>({
    queryKey: queryKeys.user(id),
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, UserCreate>({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onError: (error) => {
      Alert.alert("Error creating user", error.message);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string; data: UserUpdate }>({
    mutationFn: ({ id, data }) => usersApi.updateUser(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
    },
    onError: (error) => {
      Alert.alert("Error updating user", error.message);
    },
  });
};

export const useSetupUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string; data: UserProfileSetup }>({
    mutationFn: ({ id, data }) => usersApi.setupUserProfile(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
    },
    onError: (error) => {
      Alert.alert("Error setting up profile", error.message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: usersApi.deleteUser,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.removeQueries({ queryKey: queryKeys.user(id) });
    },
    onError: (error) => {
      Alert.alert("Error deleting user", error.message);
    },
  });
};
