/**
 * Authentication API Client
 *
 * Handles all authentication-related API calls to the FastAPI backend.
 * Uses localStorage to persist JWT tokens across sessions.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Token storage key
const AUTH_TOKEN_KEY = "auth_token";

/**
 * User type matching backend UserResponse schema
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Signup request payload
 */
export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

/**
 * Signin request payload
 */
export interface SigninRequest {
  email: string;
  password: string;
}

/**
 * Token response from backend
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * API error response
 */
export interface AuthApiError {
  detail: string;
  code?: string;
}

/**
 * Result type for auth operations
 */
export interface AuthResult<T> {
  data?: T;
  error?: string;
}

/**
 * Get stored authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Store authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Remove authentication token from localStorage
 */
export function clearAuthToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Register a new user account
 *
 * @param email - User's email address
 * @param password - User's password (min 8 characters)
 * @param name - Optional user's full name
 * @returns User object on success, error message on failure
 */
export async function signup(
  email: string,
  password: string,
  name?: string
): Promise<AuthResult<User>> {
  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error: AuthApiError = await response.json().catch(() => ({
        detail: "Failed to create account",
      }));
      return { error: error.detail };
    }

    const user: User = await response.json();
    return { data: user };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Network error. Please try again." };
  }
}

/**
 * Sign in user with email and password
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Token response on success with user data, error message on failure
 */
export async function signin(
  email: string,
  password: string
): Promise<AuthResult<{ token: TokenResponse; user: User }>> {
  try {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error: AuthApiError = await response.json().catch(() => ({
        detail: "Invalid email or password",
      }));
      return { error: error.detail };
    }

    const token: TokenResponse = await response.json();

    // Store token in localStorage
    setAuthToken(token.access_token);

    // Fetch user profile
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.data) {
      clearAuthToken();
      return { error: userResult.error || "Failed to get user profile" };
    }

    return { data: { token, user: userResult.data } };
  } catch (error) {
    console.error("Signin error:", error);
    return { error: "Network error. Please try again." };
  }
}

/**
 * Sign out user
 * Clears local token and optionally notifies backend
 */
export async function signout(): Promise<void> {
  const token = getAuthToken();

  // Clear token immediately
  clearAuthToken();

  // Optional: notify backend (JWT is stateless, so this is mainly for logging)
  if (token) {
    try {
      await fetch(`${API_URL}/api/auth/signout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      // Ignore errors on signout
      console.warn("Signout request failed:", error);
    }
  }
}

/**
 * Get current authenticated user profile
 *
 * @returns User object if authenticated, null if not authenticated, error on failure
 */
export async function getCurrentUser(): Promise<AuthResult<User>> {
  const token = getAuthToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      // Token is invalid or expired
      clearAuthToken();
      return { error: "Session expired. Please sign in again." };
    }

    if (!response.ok) {
      const error: AuthApiError = await response.json().catch(() => ({
        detail: "Failed to get user profile",
      }));
      return { error: error.detail };
    }

    const user: User = await response.json();
    return { data: user };
  } catch (error) {
    console.error("Get current user error:", error);
    return { error: "Network error. Please try again." };
  }
}

/**
 * Check if user is authenticated by verifying token and fetching user profile
 *
 * @returns true if authenticated with valid token, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const result = await getCurrentUser();
  return !!result.data;
}
