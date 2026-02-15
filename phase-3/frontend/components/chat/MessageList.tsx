"use client";

import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import { ChatMessage } from "@/lib/chat-api";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Start a conversation</p>
          <p className="text-sm mt-2">
            Send a message to get started with the AI assistant
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{ scrollBehavior: "smooth" }}
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const timestamp = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={clsx(
        "flex items-start space-x-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={clsx("flex flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={clsx(
            "rounded-lg px-4 py-3 max-w-[80%] break-words",
            isUser
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-900"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <span
          className="text-xs text-gray-500 mt-1 px-1 opacity-0 hover:opacity-100 transition-opacity"
          title={new Date(message.created_at).toLocaleString()}
        >
          {timestamp}
        </span>
      </div>
    </div>
  );
}
