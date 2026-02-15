"use client";

import { useState, useRef, KeyboardEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { clsx } from "clsx";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function MessageInput({
  onSend,
  disabled = false,
  loading = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !loading) {
      onSend(message.trim());
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const canSend = message.trim() && !disabled && !loading;

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || loading}
            rows={1}
            className={clsx(
              "w-full px-3 py-2 border rounded-lg resize-none transition-colors",
              "focus:outline-none focus:ring-2 focus:border-transparent",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              "border-gray-300 focus:ring-primary-500",
              "max-h-32 overflow-y-auto"
            )}
            style={{ minHeight: "42px" }}
          />
          <p className="mt-1 text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
        <Button
          type="submit"
          disabled={!canSend}
          loading={loading}
          size="md"
          className="shrink-0"
        >
          {!loading && <Send className="w-4 h-4 mr-2" />}
          Send
        </Button>
      </div>
    </form>
  );
}
