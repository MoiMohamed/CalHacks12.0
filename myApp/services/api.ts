import { apiClient, queryKeys } from "./api_client";
import type {} from "../types/api";

export const heathApi = {
  getHealth: async (): Promise<any> => {
    const response = await apiClient.get("/healthcheck");
    return response.data;
  },
};

// ========== Query Keys (re-export for convenience) ==========
export { queryKeys };

// ========== Default exports ==========
export default {};
