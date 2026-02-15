"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Todo, CreateTodoInput, UpdateTodoInput } from "@/types";
import { TodoItem } from "./todo-item";
import { TodoForm } from "./todo-form";
import { LoadingSpinner } from "@/components/ui/loading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getTodos();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch todos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (data: CreateTodoInput) => {
    setIsCreating(true);
    try {
      const newTodo = await api.createTodo(data);
      setTodos((prev) => [newTodo, ...prev]);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const updatedTodo = await api.toggleTodo(id);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
    } catch (err) {
      console.error("Failed to toggle todo:", err);
    }
  };

  const handleUpdate = async (id: number, data: UpdateTodoInput) => {
    const updatedTodo = await api.updateTodo(id, data);
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? updatedTodo : todo))
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteTodo(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  };

  // T045: Loading state while fetching todos
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchTodos}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <TodoForm onSubmit={handleCreate} isLoading={isCreating} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Your Todos ({todos.length})
        </h2>

        {/* T044: Empty state message when no todos exist */}
        {todos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                No todos yet. Create your first todo above!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
