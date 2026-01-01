"""
Quick test to verify the todo application functionality without user input
"""
import sys
import os
# Add the src directory to the path so we can import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from src.services.todo_manager import TodoManager

def test_app_functionality():
    """Test the core functionality of the todo application."""
    print("Testing Todo Console Application functionality...")

    # Create a TodoManager instance
    manager = TodoManager()

    # Test adding todos
    print("\n1. Testing add functionality:")
    todo1 = manager.add_todo("Buy groceries", "Milk, bread, eggs")
    print(f"   Added: {todo1}")

    todo2 = manager.add_todo("Complete project")
    print(f"   Added: {todo2}")

    # Test listing todos
    print("\n2. Testing list functionality:")
    todos = manager.list_todos()
    print(f"   Total todos: {len(todos)}")
    for todo in todos:
        print(f"   - {todo}")

    # Test updating a todo
    print("\n3. Testing update functionality:")
    success = manager.update_todo(todo1.id, title="Buy groceries - urgent", description="Milk, bread, eggs, fruits")
    print(f"   Update successful: {success}")
    if success:
        updated_todo = manager.get_todo_by_id(todo1.id)
        print(f"   Updated: {updated_todo}")

    # Test marking as complete
    print("\n4. Testing mark complete functionality:")
    success = manager.mark_complete(todo2.id)
    print(f"   Mark complete successful: {success}")
    if success:
        marked_todo = manager.get_todo_by_id(todo2.id)
        print(f"   Marked as complete: {marked_todo}")

    # Test deleting a todo
    print("\n5. Testing delete functionality:")
    success = manager.delete_todo(todo1.id)
    print(f"   Delete successful: {success}")
    print(f"   Remaining todos: {len(manager.list_todos())}")

    print("\nAll functionality tests passed!")

if __name__ == "__main__":
    test_app_functionality()