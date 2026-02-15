"use client";

import { clsx } from "clsx";

interface TypingIndicatorProps {
  isVisible: boolean;
}

export function TypingIndicator({ isVisible }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="flex items-start space-x-2 mb-4">
      <div className="flex-1 flex justify-start">
        <div className="bg-gray-200 text-gray-700 rounded-lg px-4 py-3 max-w-[80%]">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Assistant is typing</span>
            <div className="flex space-x-1">
              <div
                className={clsx(
                  "w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce",
                  "[animation-delay:-0.3s]"
                )}
              />
              <div
                className={clsx(
                  "w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce",
                  "[animation-delay:-0.15s]"
                )}
              />
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
