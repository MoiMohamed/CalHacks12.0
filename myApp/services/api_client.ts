import axios, { isAxiosError } from "axios";
import type { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import Constants from "expo-constants";

// API Configuration
// Use your laptop's IP for mobile development, localhost for web
const getApiUrl = () => {
  // Check if we're running on a mobile device (not web)
  if (Constants.platform?.ios || Constants.platform?.android) {
    return "http://10.112.17.36:8000"; // Your laptop's IP
  }
  return "http://localhost:8000"; // For web development
};

export const apiURL = (
  Constants.expoConfig?.extra?.apiUrl || getApiUrl()
).replace(/\/$/, "");

// Create axios instance with defaults
const axiosInstance = axios.create({
  baseURL: apiURL,
  timeout: 40000, // 40 second timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Enhanced request config interface
interface AxiosRequestConfigPatch extends Omit<AxiosRequestConfig, "method"> {
  method?: Method; // axios sets it as string, which is unhelpful and can lead to bugs
}

// Custom API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Custom Authentication Error class
export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

// Request interceptor for logging and auth
axiosInstance.interceptors.request.use(
  (config) => {
    // Add timestamp to requests for debugging
    if (__DEV__) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          params: config.params,
          data: config.data,
        }
      );
    }
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (__DEV__) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }
    return response;
  },
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      // Throw authentication error and let the router handle it
      console.warn("[Auth Error] Authentication failed");
      throw new AuthenticationError("Authentication required");
    }
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message =
        data?.detail || data?.message || error.message || "An error occurred";

      console.error(`[API Error] ${status}:`, {
        url: error.config?.url,
        method: error.config?.method,
        message,
        data,
      });

      throw new ApiError(message, status, data);
    } else if (error.request) {
      // Network error
      console.error("[Network Error]", error.request);
      throw new ApiError("Network error - please check your connection", 0);
    } else {
      // Other error
      console.error("[Request Setup Error]", error.message);
      throw new ApiError(error.message, 0);
    }
  }
);

// Main API function with enhanced error handling
export function backendApi<T>(
  config: AxiosRequestConfigPatch
): Promise<AxiosResponse<T>> {
  return axiosInstance.request<T>(config);
}

// Utility functions for common operations
export const apiClient = {
  // GET request
  get: <T>(
    url: string,
    config?: AxiosRequestConfigPatch
  ): Promise<AxiosResponse<T>> =>
    backendApi<T>({ ...config, method: "GET", url }),

  // POST request
  post: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfigPatch
  ): Promise<AxiosResponse<T>> =>
    backendApi<T>({ ...config, method: "POST", url, data }),

  // PUT request
  put: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfigPatch
  ): Promise<AxiosResponse<T>> =>
    backendApi<T>({ ...config, method: "PUT", url, data }),

  // PATCH request
  patch: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfigPatch
  ): Promise<AxiosResponse<T>> =>
    backendApi<T>({ ...config, method: "PATCH", url, data }),

  // DELETE request
  delete: <T>(
    url: string,
    config?: AxiosRequestConfigPatch
  ): Promise<AxiosResponse<T>> =>
    backendApi<T>({ ...config, method: "DELETE", url }),
};

// Configuration utilities
export function configureAxiosInstance(options: {
  withCredentials?: boolean;
  defaultHeaders?: Record<string, string>;
}) {
  if (options.withCredentials !== undefined) {
    axiosInstance.defaults.withCredentials = options.withCredentials;
  }

  if (options.defaultHeaders) {
    Object.assign(axiosInstance.defaults.headers, options.defaultHeaders);
  }
}

export function isAuthEnabled() {
  return axiosInstance.defaults.withCredentials;
}

// Query key factory for TanStack Query
export const queryKeys = {};

// TanStack Query default options
export const queryDefaults = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: (failureCount: number, error: unknown) => {
    // Never retry on explicit auth errors
    if (error instanceof AuthenticationError) {
      return false;
    }
    // Don't retry on generic 4xx API errors (client errors)
    if (
      error instanceof ApiError &&
      error.status >= 400 &&
      error.status < 500
    ) {
      return false;
    }
    // Retry up to 3 times for other errors (network, 5xx, etc.)
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
};
