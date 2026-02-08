// User type (from Better Auth)
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

// Todo type
export interface Todo {
  id: number;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Input types for API requests
export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

// API response types
export interface ApiError {
  detail: string;
  code?: string;
}

// Auth types
export interface Session {
  user: User | null;
  token: string | null;
}
