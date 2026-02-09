"use client";

import { useState } from "react";
import { Todo, UpdateTodoInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TodoItemProps {
  todo: Todo;
  onToggle?: (id: number) => Promise<void>;
  onUpdate?: (id: number, data: UpdateTodoInput) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  // T054: Edit mode toggle state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
  };

  // T057: Validation preventing empty title, T058: Update API call
  const handleSave = async () => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setError("Title cannot be empty");
      return;
    }

    if (onUpdate) {
      setIsLoading(true);
      try {
        await onUpdate(todo.id, {
          title: trimmedTitle,
          description: editDescription.trim() || undefined,
        });
        setIsEditing(false);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // T061-T063: Delete with confirmation
  const handleDelete = async () => {
    if (onDelete) {
      setIsLoading(true);
      try {
        await onDelete(todo.id);
      } finally {
        setIsLoading(false);
        setShowDeleteConfirm(false);
      }
    }
  };

  // T054-T056: Edit mode with inline form
  if (isEditing) {
    return (
      <div className="p-4 bg-white rounded-lg border shadow-sm space-y-3">
        <div>
          <Input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title"
            disabled={isLoading}
            className="w-full"
          />
        </div>
        <div>
          <Input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            disabled={isLoading}
            className="w-full"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button variant="secondary" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 pt-1">
        {onToggle && (
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className={`text-base font-medium ${
            todo.completed ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {todo.title}
        </h3>
        {todo.description && (
          <p
            className={`mt-1 text-sm ${
              todo.completed ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {todo.description}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          Created: {new Date(todo.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex-shrink-0 flex gap-2">
        {onUpdate && (
          <button
            onClick={handleEdit}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        )}
        {onDelete && !showDeleteConfirm && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        )}
        {/* T061: Delete confirmation */}
        {showDeleteConfirm && (
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500">Delete?</span>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Yes
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
