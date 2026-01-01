"""
TodoManager Service
Manages the collection of todos in memory.
"""

from typing import List, Optional
from src.models.todo import Todo


class TodoManager:
    """
    A service class to manage todos in memory.

    This class provides CRUD operations for todos and handles in-memory storage.
    """

    def __init__(self):
        """Initialize the TodoManager with an empty list of todos."""
        self._todos: List[Todo] = []
        self._next_id = 1

    def add_todo(self, title: str, description: str = "") -> Todo:
        """
        Add a new todo to the collection.

        Args:
            title (str): Title of the todo (required)
            description (str): Optional description of the todo

        Returns:
            Todo: The newly created todo with assigned ID

        Raises:
            ValueError: If title is empty
        """
        new_todo = Todo(id=self._get_next_id(), title=title, description=description)
        self._todos.append(new_todo)
        return new_todo

    def get_todo_by_id(self, todo_id: int) -> Optional[Todo]:
        """
        Get a todo by its ID.

        Args:
            todo_id (int): ID of the todo to retrieve

        Returns:
            Todo: The todo with the given ID, or None if not found
        """
        for todo in self._todos:
            if todo.id == todo_id:
                return todo
        return None

    def list_todos(self) -> List[Todo]:
        """
        Get all todos in the collection.

        Returns:
            List[Todo]: List of all todos
        """
        return self._todos.copy()  # Return a copy to prevent external modification

    def update_todo(self, todo_id: int, title: Optional[str] = None, description: Optional[str] = None) -> bool:
        """
        Update an existing todo.

        Args:
            todo_id (int): ID of the todo to update
            title (str, optional): New title for the todo
            description (str, optional): New description for the todo

        Returns:
            bool: True if the todo was updated, False if not found
        """
        todo = self.get_todo_by_id(todo_id)
        if todo is None:
            return False

        if title is not None:
            if not title.strip():
                raise ValueError("Title cannot be empty")
            todo.title = title.strip()

        if description is not None:
            todo.description = description.strip() if description else ""

        return True

    def delete_todo(self, todo_id: int) -> bool:
        """
        Delete a todo by its ID.

        Args:
            todo_id (int): ID of the todo to delete

        Returns:
            bool: True if the todo was deleted, False if not found
        """
        for i, todo in enumerate(self._todos):
            if todo.id == todo_id:
                del self._todos[i]
                return True
        return False

    def mark_complete(self, todo_id: int) -> bool:
        """
        Mark a todo as complete.

        Args:
            todo_id (int): ID of the todo to mark as complete

        Returns:
            bool: True if the todo was marked complete, False if not found
        """
        todo = self.get_todo_by_id(todo_id)
        if todo is None:
            return False

        todo.completed = True
        return True

    def mark_incomplete(self, todo_id: int) -> bool:
        """
        Mark a todo as incomplete.

        Args:
            todo_id (int): ID of the todo to mark as incomplete

        Returns:
            bool: True if the todo was marked incomplete, False if not found
        """
        todo = self.get_todo_by_id(todo_id)
        if todo is None:
            return False

        todo.completed = False
        return True

    def _get_next_id(self) -> int:
        """
        Get the next available ID and increment the counter.

        Returns:
            int: The next available ID
        """
        current_id = self._next_id
        self._next_id += 1
        return current_id