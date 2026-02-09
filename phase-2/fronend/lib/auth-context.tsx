"use client";

/**
 * Authentication Context Provider
 *
 * Provides authentication state and methods throughout the application.
 * Uses localStorage for token persistence and React Context for state management.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  signup as apiSignup,
  signin as apiSignin,
  signout as apiSignout,
  getCurrentUser,
  clearAuthToken,
  type User,
  type AuthResult,
} from "./auth-api";

/**
 * Authentication context state
 */
interface AuthContextState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (
    email: string,
    password: string,
    name?: string
  ) => Promise<AuthResult<User>>;
  signin: (email: string, password: string) => Promise<AuthResult<User>>;
  signout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Custom hook to access authentication context
 *
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Authentication Provider Component
 *
 * Wraps the application and provides authentication state and methods.
 * Automatically fetches user profile on mount if token exists.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Fetch current user profile on mount
   */
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    const result = await getCurrentUser();

    if (result.data) {
      setUser(result.data);
    } else {
      setUser(null);
      // Clear invalid token
      if (result.error?.includes("expired") || result.error?.includes("invalid")) {
        clearAuthToken();
      }
    }

    setIsLoading(false);
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /**
   * Sign up new user
   */
  const signup = useCallback(
    async (
      email: string,
      password: string,
      name?: string
    ): Promise<AuthResult<User>> => {
      setIsLoading(true);

      // First create the account
      const signupResult = await apiSignup(email, password, name);

      if (signupResult.error || !signupResult.data) {
        setIsLoading(false);
        return signupResult;
      }

      // Then sign in to get the token
      const signinResult = await apiSignin(email, password);

      if (signinResult.error || !signinResult.data) {
        setIsLoading(false);
        return {
          error: signinResult.error || "Account created but signin failed. Please sign in manually.",
        };
      }

      // Set user state
      setUser(signinResult.data.user);
      setIsLoading(false);

      return { data: signinResult.data.user };
    },
    []
  );

  /**
   * Sign in existing user
   */
  const signin = useCallback(
    async (email: string, password: string): Promise<AuthResult<User>> => {
      setIsLoading(true);

      const result = await apiSignin(email, password);

      if (result.error || !result.data) {
        setIsLoading(false);
        return { error: result.error };
      }

      // Set user state
      setUser(result.data.user);
      setIsLoading(false);

      return { data: result.data.user };
    },
    []
  );

  /**
   * Sign out user
   */
  const signout = useCallback(async () => {
    setIsLoading(true);

    await apiSignout();

    // Clear user state
    setUser(null);
    setIsLoading(false);

    // Redirect to signin page
    router.push("/signin");
  }, [router]);

  const value: AuthContextState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signup,
    signin,
    signout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
