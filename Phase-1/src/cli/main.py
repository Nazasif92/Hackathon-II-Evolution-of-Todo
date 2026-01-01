#!/usr/bin/env python3
"""
Todo Console Application
A command-line based Todo application with in-memory storage.
"""

import sys
import os
# Add the src directory to the path so we can import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from src.services.todo_manager import TodoManager


def display_menu():
    """Display the main menu options."""
    print("\n" + "="*40)
    print("TODO CONSOLE APPLICATION")
    print("="*40)
    print("1. Add Todo")
    print("2. View All Todos")
    print("3. Update Todo")
    print("4. Delete Todo")
    print("5. Mark Todo as Complete")
    print("6. Mark Todo as Incomplete")
    print("7. Exit")
    print("="*40)


def get_user_choice():
    """Get and validate user's menu choice."""
    try:
        choice = input("Enter your choice (1-7): ").strip()
        return int(choice)
    except ValueError:
        print("Invalid input. Please enter a number between 1 and 7.")
        return None


def add_todo(todo_manager: TodoManager):
    """Add a new todo."""
    print("\n--- Add New Todo ---")
    title = input("Enter title: ").strip()

    if not title:
        print("Title cannot be empty!")
        return

    description = input("Enter description (optional, press Enter to skip): ").strip()
    description = description if description else ""

    try:
        todo = todo_manager.add_todo(title, description)
        print(f"Todo added successfully with ID: {todo.id}")
    except ValueError as e:
        print(f"Error adding todo: {e}")


def view_todos(todo_manager: TodoManager):
    """View all todos."""
    print("\n--- All Todos ---")
    todos = todo_manager.list_todos()

    if not todos:
        print("No todos found.")
        return

    for todo in todos:
        status = "✓" if todo.completed else "○"
        print(f"[{status}] {todo.id}. {todo.title}")
        if todo.description:
            print(f"    Description: {todo.description}")
        print()


def update_todo(todo_manager: TodoManager):
    """Update an existing todo."""
    print("\n--- Update Todo ---")
    try:
        todo_id = int(input("Enter todo ID to update: ").strip())
    except ValueError:
        print("Invalid ID. Please enter a number.")
        return

    # Check if todo exists
    todo = todo_manager.get_todo_by_id(todo_id)
    if not todo:
        print(f"Todo with ID {todo_id} not found.")
        return

    print(f"Current todo: {todo}")

    new_title = input(f"Enter new title (current: '{todo.title}', press Enter to keep current): ").strip()
    new_description = input(f"Enter new description (current: '{todo.description}', press Enter to keep current): ").strip()

    # Use current values if user didn't provide new ones
    title = new_title if new_title else None
    description = new_description if new_description else None

    if title is not None or description is not None:
        try:
            success = todo_manager.update_todo(todo_id, title, description)
            if success:
                print("Todo updated successfully!")
            else:
                print("Failed to update todo.")
        except ValueError as e:
            print(f"Error updating todo: {e}")
    else:
        print("No changes made.")


def delete_todo(todo_manager: TodoManager):
    """Delete a todo."""
    print("\n--- Delete Todo ---")
    try:
        todo_id = int(input("Enter todo ID to delete: ").strip())
    except ValueError:
        print("Invalid ID. Please enter a number.")
        return

    success = todo_manager.delete_todo(todo_id)
    if success:
        print(f"Todo with ID {todo_id} deleted successfully!")
    else:
        print(f"Todo with ID {todo_id} not found.")


def mark_todo_complete(todo_manager: TodoManager):
    """Mark a todo as complete."""
    print("\n--- Mark Todo as Complete ---")
    try:
        todo_id = int(input("Enter todo ID to mark as complete: ").strip())
    except ValueError:
        print("Invalid ID. Please enter a number.")
        return

    success = todo_manager.mark_complete(todo_id)
    if success:
        print(f"Todo with ID {todo_id} marked as complete!")
    else:
        print(f"Todo with ID {todo_id} not found.")


def mark_todo_incomplete(todo_manager: TodoManager):
    """Mark a todo as incomplete."""
    print("\n--- Mark Todo as Incomplete ---")
    try:
        todo_id = int(input("Enter todo ID to mark as incomplete: ").strip())
    except ValueError:
        print("Invalid ID. Please enter a number.")
        return

    success = todo_manager.mark_incomplete(todo_id)
    if success:
        print(f"Todo with ID {todo_id} marked as incomplete!")
    else:
        print(f"Todo with ID {todo_id} not found.")


def main():
    """Main entry point for the todo console application."""
    print("Welcome to the Todo Console Application!")

    # Initialize the TodoManager
    todo_manager = TodoManager()

    while True:
        display_menu()
        choice = get_user_choice()

        if choice == 1:
            add_todo(todo_manager)
        elif choice == 2:
            view_todos(todo_manager)
        elif choice == 3:
            update_todo(todo_manager)
        elif choice == 4:
            delete_todo(todo_manager)
        elif choice == 5:
            mark_todo_complete(todo_manager)
        elif choice == 6:
            mark_todo_incomplete(todo_manager)
        elif choice == 7:
            print("Thank you for using the Todo Console Application!")
            break
        else:
            if choice is not None:  # Only show error if it was a valid number but out of range
                print("Invalid choice. Please enter a number between 1 and 7.")

        # Pause to let user see the result before showing menu again
        input("\nPress Enter to continue...")


if __name__ == "__main__":
    main()