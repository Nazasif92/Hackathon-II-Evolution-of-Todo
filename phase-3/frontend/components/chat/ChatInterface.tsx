"use client";

import { useState, useCallback, useEffect } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import {
  ChatMessage,
  sendMessage as apiSendMessage,
  getMessages,
} from "@/lib/chat-api";
import { getMe, type User } from "@/lib/auth-client";

interface ChatInterfaceProps {
  initialConversationId?: string;
}

export function ChatInterface({ initialConversationId }: ChatInterfaceProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current user on mount
  useEffect(() => {
    const loadUser = async () => {
      const user = await getMe();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  // Load existing conversation messages on mount (if initialConversationId provided)
  useEffect(() => {
    if (initialConversationId) {
      loadMessages(initialConversationId);
    }
  }, [initialConversationId]);

  const loadMessages = async (convId: string) => {
    try {
      setIsLoading(true);
      const loadedMessages = await getMessages(convId);
      setMessages(loadedMessages);
      setError(null);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Failed to load conversation history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!currentUser) {
        setError("You must be signed in to send messages");
        return;
      }

      // Add user message optimistically
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId || "",
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setIsTyping(true);
      setError(null);

      try {
        const response = await apiSendMessage(conversationId, content);

        // Update conversation ID if this was the first message
        if (!conversationId) {
          setConversationId(response.conversation_id);
        }

        // Replace temp user message and add assistant response
        setMessages((prev) => {
          const withoutTemp = prev.filter((msg) => msg.id !== userMessage.id);
          return [
            ...withoutTemp,
            {
              id: response.message_id,
              conversation_id: response.conversation_id,
              role: "user",
              content,
              created_at: new Date().toISOString(),
            },
            {
              id: `assistant-${response.message_id}`,
              conversation_id: response.conversation_id,
              role: "assistant",
              content: response.response,
              created_at: new Date().toISOString(),
            },
          ];
        });

        // Show tasks affected if any
        if (response.tasks_affected && response.tasks_affected.length > 0) {
          console.log("Tasks affected:", response.tasks_affected);
          // You could show a toast notification here
        }
      } catch (err) {
        console.error("Failed to send message:", err);
        setError(
          err instanceof Error ? err.message : "Failed to send message"
        );
        // Remove the optimistic user message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    [conversationId, currentUser]
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <MessageList messages={messages} />
        <TypingIndicator isVisible={isTyping} />
      </div>

      {/* Input area */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={!currentUser || isLoading}
        loading={isLoading}
      />
    </div>
  );
}
