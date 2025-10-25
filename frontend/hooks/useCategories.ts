import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/api_client";
import { categoriesApi } from "@/services/api";
import type { Category, CategoryCreate, CategoryUpdate } from "@/types/api";
import { Alert } from "react-native";

// ========== Category Hooks ==========

export const useUserCategories = (userId: string) => {
  return useQuery<Category[], Error>({
    queryKey: queryKeys.userCategories(userId),
    queryFn: () => categoriesApi.getUserCategories(userId),
    enabled: !!userId,
  });
};

export const useCategory = (id: string) => {
  return useQuery<Category, Error>({
    queryKey: queryKeys.category(id),
    queryFn: () => categoriesApi.getCategory(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, CategoryCreate>({
    mutationFn: categoriesApi.createCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userCategories(data.user_id),
      });
    },
    onError: (error) => {
      Alert.alert("Error creating category", error.message);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, { id: string; data: CategoryUpdate }>({
    mutationFn: ({ id, data }) => categoriesApi.updateCategory(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({
        queryKey: queryKeys.category(variables.id),
      });
    },
    onError: (error) => {
      Alert.alert("Error updating category", error.message);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: categoriesApi.deleteCategory,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.removeQueries({ queryKey: queryKeys.category(id) });
    },
    onError: (error) => {
      Alert.alert("Error deleting category", error.message);
    },
  });
};

export const useGetOrCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, { userId: string; categoryName: string }>(
    {
      mutationFn: ({ userId, categoryName }) =>
        categoriesApi.getOrCreateCategory(userId, categoryName),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.categories });
        queryClient.invalidateQueries({
          queryKey: queryKeys.userCategories(data.user_id),
        });
      },
      onError: (error) => {
        Alert.alert("Error getting/creating category", error.message);
      },
    }
  );
};
