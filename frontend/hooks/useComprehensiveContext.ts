import { useQuery } from "@tanstack/react-query";
import { missionsApi, routinesApi, categoriesApi } from "@/services/api";
import type { Mission, Routine, Category } from "@/types/api";

interface ComprehensiveContext {
  // From AI context
  recent_missions: Mission[];
  overdue_missions: Mission[];
  today_missions: Mission[];
  total_pending: number;
  reward: {
    points: number;
    streak: number;
    total_tasks_done: number;
    milestones_unlocked: string;
  } | null;
  // All missions (for schedule)
  all_missions: Mission[];
  // Routines
  routines: Routine[];
  // Categories
  categories: Category[];
}

/**
 * Custom hook that fetches comprehensive context for the user
 * Combines AI context (missions) with routines and categories
 */
export const useComprehensiveContext = (userId: string) => {
  return useQuery<ComprehensiveContext, Error>({
    queryKey: ["comprehensive-context", userId],
    queryFn: async () => {
      console.log("[useComprehensiveContext] Starting fetch for user:", userId);

      try {
        // Fetch AI context, missions, routines, and categories in parallel
        const [aiContext, allMissions, routines, categories] =
          await Promise.all([
            missionsApi.getAIContext(userId).catch((err) => {
              console.error(
                "[useComprehensiveContext] AI Context fetch failed:",
                err
              );
              throw err;
            }),
            missionsApi.getUserMissions(userId).catch((err) => {
              console.error(
                "[useComprehensiveContext] Missions fetch failed:",
                err
              );
              throw err;
            }),
            routinesApi.getUserRoutines(userId).catch((err) => {
              console.error(
                "[useComprehensiveContext] Routines fetch failed:",
                err
              );
              throw err;
            }),
            categoriesApi.getUserCategories(userId).catch((err) => {
              console.error(
                "[useComprehensiveContext] Categories fetch failed:",
                err
              );
              throw err;
            }),
          ]);

        console.log(
          "[useComprehensiveContext] ✅ Successfully fetched all data"
        );
        console.log("- Missions:", allMissions.length);
        console.log("- Routines:", routines.length);
        console.log("- Categories:", categories.length);

        return {
          ...aiContext,
          all_missions: allMissions,
          routines: routines,
          categories: categories,
        };
      } catch (error) {
        console.error("[useComprehensiveContext] ❌ Fatal error:", error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 3000, // Data stays fresh for 3 seconds
    refetchInterval: 3000, // Auto-refetch every 3 seconds to catch agent updates
    retry: 3, // Retry failed requests 3 times
    retryDelay: 1000, // Wait 1 second between retries
  });
};
