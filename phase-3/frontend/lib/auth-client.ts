"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "auth_token";

/**
 * User interface matching backend response
 */
export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
}

/**
 * Auth response from backend
 */
interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    created_at: string;
  };
}

/**
 * Error response from backend
 */
interface ApiError {
  detail: string;
}

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Save JWT token to localStorage
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove JWT token from localStorage
 */
export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Sign up a new user
 * @param email - User email
 * @param password - User password
 * @returns Promise with auth token or error
 */
export async function signup(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        // Handle both ApiError and validation errors
        const errorMsg = typeof errorData === "object" && errorData.detail
          ? errorData.detail
          : Array.isArray(errorData)
          ? errorData[0]?.msg || "Invalid request"
          : "Request failed";
        return { success: false, error: String(errorMsg) };
      } catch {
        return { success: false, error: `Request failed with status ${response.status}` };
      }
    }

    const data: AuthResponse = await response.json();
    setToken(data.token);
    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Sign in an existing user
 * @param email - User email
 * @param password - User password
 * @returns Promise with auth token or error
 */
export async function signin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        // Handle both ApiError and validation errors
        const errorMsg = typeof errorData === "object" && errorData.detail
          ? errorData.detail
          : Array.isArray(errorData)
          ? errorData[0]?.msg || "Invalid request"
          : "Request failed";
        return { success: false, error: String(errorMsg) };
      } catch {
        return { success: false, error: `Request failed with status ${response.status}` };
      }
    }

    const data: AuthResponse = await response.json();
    setToken(data.token);
    return { success: true };
  } catch (error) {
    console.error("Signin error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Sign out current user
 */
export async function signout(): Promise<void> {
  const token = getToken();

  if (token) {
    try {
      await fetch(`${API_URL}/api/auth/signout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Signout error:", error);
    }
  }

  clearToken();
}

/**
 * Get current user from backend
 * @returns Promise with user data or null
 */
export async function getMe(): Promise<User | null> {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearToken();
      }
      return null;
    }

    const user: User = await response.json();
    return user;
  } catch (error) {
    console.error("GetMe error:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}
