"use client";

import { authClient } from "./auth-client";
import { Todo, CreateTodoInput, UpdateTodoInput, ApiError } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * API Client Configuration
 */
interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get JWT token from Better Auth session
   * When JWT plugin is enabled, Better Auth creates a token accessible via the session
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      // For Better Auth with JWT plugin, we need to get the token from cookies or session endpoint
      // The JWT token is typically stored in a cookie named "better-auth.session_token"
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split("=");
          if (name === "better-auth.session_token") {
            return decodeURIComponent(value);
          }
        }
      }

      // Fallback: try to get from session API
      const session = await authClient.getSession();
      if (session?.data) {
        // Check if token is directly in session data
        const sessionData = session.data as any;
        return sessionData.token || sessionData.accessToken || null;
      }

      return null;
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  }

  /**
   * Core request method with automatic JWT token attachment
   * Handles 401 responses by redirecting to /signin
   */
  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    };

    // Attach JWT token to Authorization header
    if (!skipAuth) {
      const token = await this.getAuthToken();
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 Unauthorized - redirect to signin
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
      throw new Error("Unauthorized - redirecting to signin");
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: "An unexpected error occurred",
      }));
      throw new Error(error.detail);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Todo API methods
  async getTodos(): Promise<Todo[]> {
    return this.request<Todo[]>("/api/todos");
  }

  async getTodo(id: number): Promise<Todo> {
    return this.request<Todo>(`/api/todos/${id}`);
  }

  async createTodo(data: CreateTodoInput): Promise<Todo> {
    return this.request<Todo>("/api/todos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTodo(id: number, data: UpdateTodoInput): Promise<Todo> {
    return this.request<Todo>(`/api/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async toggleTodo(id: number): Promise<Todo> {
    return this.request<Todo>(`/api/todos/${id}/toggle`, {
      method: "PATCH",
    });
  }

  async deleteTodo(id: number): Promise<void> {
    return this.request<void>(`/api/todos/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient(API_URL);

/**
 * Typed helper functions for making API requests
 * These are generic wrappers around the core request method
 */

/**
 * GET request helper
 * @param endpoint - API endpoint path
 * @param options - Optional fetch options
 */
export async function apiGet<T>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  const apiClient = new ApiClient(API_URL);
  return apiClient.request<T>(endpoint, {
    method: "GET",
    ...options,
  });
}

/**
 * POST request helper with automatic JSON body serialization
 */
export async function apiPost<T>(
  endpoint: string,
  data?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  const apiClient = new ApiClient(API_URL);
  return apiClient.request<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PUT request helper for full resource updates
 */
export async function apiPut<T>(
  endpoint: string,
  data?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  const apiClient = new ApiClient(API_URL);
  return apiClient.request<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = void>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  const apiClient = new ApiClient(API_URL);
  return apiClient.request<T>(endpoint, {
    method: "DELETE",
    ...options,
  });
}

/**
 * PATCH request helper for partial updates
 */
export async function apiPatch<T>(
  endpoint: string,
  data?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  const apiClient = new ApiClient(API_URL);
  return apiClient.request<T>(endpoint, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}
