"use client";

import { ChatInterface } from "@/components/chat";

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Chat with Assistant</h1>
        <p className="text-sm text-gray-600 mt-1">
          Ask me to create, update, or manage your todos
        </p>
      </div>
      <div className="h-[calc(100%-4rem)]">
        <ChatInterface />
      </div>
    </div>
  );
}
