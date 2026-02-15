"use client";

// Chat API client for Todo AI Chatbot
// This module provides functions to interact with the chat backend API

import { getToken } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  response: string;
  tasks_affected: TaskAffected[];
}

export interface TaskAffected {
  id: number;
  action: 'created' | 'updated' | 'completed' | 'deleted';
  title: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message_preview?: string;
}

/**
 * Get JWT token from localStorage
 */
function getAuthToken(): string | null {
  return getToken();
}

/**
 * Send a message to the chat API
 * Creates a new conversation if conversationId is null
 */
export async function sendMessage(
  conversationId: string | null,
  message: string
): Promise<ChatResponse> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
    }),
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    throw new Error("Unauthorized - redirecting to signin");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Failed to send message",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

/**
 * Get list of user's conversations
 */
export async function getConversations(limit?: number): Promise<Conversation[]> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = new URL(`${API_URL}/api/chat/conversations`);
  if (limit) {
    url.searchParams.append("limit", limit.toString());
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    throw new Error("Unauthorized - redirecting to signin");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Failed to fetch conversations",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

/**
 * Get messages for a specific conversation
 */
export async function getMessages(
  conversationId: string,
  limit?: number
): Promise<ChatMessage[]> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = new URL(`${API_URL}/api/chat/conversations/${conversationId}/messages`);
  if (limit) {
    url.searchParams.append("limit", limit.toString());
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    throw new Error("Unauthorized - redirecting to signin");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Failed to fetch messages",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}
