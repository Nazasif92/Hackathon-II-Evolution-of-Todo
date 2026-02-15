"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateTodoInput } from "@/types";

interface TodoFormProps {
  onSubmit: (data: CreateTodoInput) => Promise<void>;
  isLoading?: boolean;
}

export function TodoForm({ onSubmit, isLoading = false }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // T046: Title validation - not empty/whitespace
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title cannot be empty");
      return;
    }

    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim() || undefined,
      });
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create todo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          className="w-full"
        />
      </div>
      <div>
        <Input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          className="w-full"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? "Adding..." : "Add Todo"}
      </Button>
    </form>
  );
}
