"""
Unit tests for the TodoManager service.
"""
import unittest
from src.services.todo_manager import TodoManager
from src.models.todo import Todo


class TestTodoManager(unittest.TestCase):
    """Test cases for the TodoManager service."""

    def setUp(self):
        """Set up a fresh TodoManager instance for each test."""
        self.manager = TodoManager()

    def test_add_todo_creates_new_todo(self):
        """Test that add_todo creates a new todo with correct properties."""
        todo = self.manager.add_todo("Test Title", "Test Description")

        self.assertIsInstance(todo, Todo)
        self.assertEqual(todo.title, "Test Title")
        self.assertEqual(todo.description, "Test Description")
        self.assertEqual(todo.completed, False)
        self.assertEqual(todo.id, 1)  # First todo should have ID 1

    def test_add_todo_without_description(self):
        """Test that add_todo works with only a title."""
        todo = self.manager.add_todo("Test Title")

        self.assertEqual(todo.title, "Test Title")
        self.assertEqual(todo.description, "")
        self.assertEqual(todo.completed, False)

    def test_add_todo_fails_with_empty_title(self):
        """Test that add_todo raises ValueError with empty title."""
        with self.assertRaises(ValueError):
            self.manager.add_todo("")

        with self.assertRaises(ValueError):
            self.manager.add_todo("   ")  # whitespace-only title

    def test_get_todo_by_id_returns_correct_todo(self):
        """Test that get_todo_by_id returns the correct todo."""
        todo1 = self.manager.add_todo("First Todo", "Description 1")
        todo2 = self.manager.add_todo("Second Todo", "Description 2")

        retrieved_todo = self.manager.get_todo_by_id(todo1.id)
        self.assertEqual(retrieved_todo.id, todo1.id)
        self.assertEqual(retrieved_todo.title, todo1.title)
        self.assertEqual(retrieved_todo.description, todo1.description)

        retrieved_todo2 = self.manager.get_todo_by_id(todo2.id)
        self.assertEqual(retrieved_todo2.id, todo2.id)
        self.assertEqual(retrieved_todo2.title, todo2.title)
        self.assertEqual(retrieved_todo2.description, todo2.description)

    def test_get_todo_by_id_returns_none_for_nonexistent_id(self):
        """Test that get_todo_by_id returns None for non-existent IDs."""
        result = self.manager.get_todo_by_id(999)
        self.assertIsNone(result)

    def test_list_todos_returns_all_todos(self):
        """Test that list_todos returns all todos."""
        todo1 = self.manager.add_todo("First Todo")
        todo2 = self.manager.add_todo("Second Todo")
        todo3 = self.manager.add_todo("Third Todo")

        todos = self.manager.list_todos()

        self.assertEqual(len(todos), 3)
        self.assertIn(todo1, todos)
        self.assertIn(todo2, todos)
        self.assertIn(todo3, todos)

    def test_list_todos_returns_copy_of_internal_list(self):
        """Test that list_todos returns a copy, not the internal list."""
        original_list = self.manager.list_todos()
        self.manager.add_todo("New Todo")

        new_list = self.manager.list_todos()
        self.assertEqual(len(original_list) + 1, len(new_list))

    def test_update_todo_updates_title(self):
        """Test that update_todo updates the title."""
        todo = self.manager.add_todo("Original Title", "Original Description")

        success = self.manager.update_todo(todo.id, title="New Title")

        self.assertTrue(success)
        updated_todo = self.manager.get_todo_by_id(todo.id)
        self.assertEqual(updated_todo.title, "New Title")
        self.assertEqual(updated_todo.description, "Original Description")  # Should remain unchanged

    def test_update_todo_updates_description(self):
        """Test that update_todo updates the description."""
        todo = self.manager.add_todo("Original Title", "Original Description")

        success = self.manager.update_todo(todo.id, description="New Description")

        self.assertTrue(success)
        updated_todo = self.manager.get_todo_by_id(todo.id)
        self.assertEqual(updated_todo.description, "New Description")
        self.assertEqual(updated_todo.title, "Original Title")  # Should remain unchanged

    def test_update_todo_updates_both_fields(self):
        """Test that update_todo updates both title and description."""
        todo = self.manager.add_todo("Original Title", "Original Description")

        success = self.manager.update_todo(todo.id, title="New Title", description="New Description")

        self.assertTrue(success)
        updated_todo = self.manager.get_todo_by_id(todo.id)
        self.assertEqual(updated_todo.title, "New Title")
        self.assertEqual(updated_todo.description, "New Description")

    def test_update_todo_returns_false_for_nonexistent_id(self):
        """Test that update_todo returns False for non-existent IDs."""
        success = self.manager.update_todo(999, title="New Title")
        self.assertFalse(success)

    def test_update_todo_fails_with_empty_title(self):
        """Test that update_todo raises ValueError when updating with empty title."""
        todo = self.manager.add_todo("Original Title")

        with self.assertRaises(ValueError):
            self.manager.update_todo(todo.id, title="")

    def test_delete_todo_removes_todo(self):
        """Test that delete_todo removes the todo."""
        todo = self.manager.add_todo("Test Todo")

        success = self.manager.delete_todo(todo.id)

        self.assertTrue(success)
        self.assertIsNone(self.manager.get_todo_by_id(todo.id))
        self.assertEqual(len(self.manager.list_todos()), 0)

    def test_delete_todo_returns_false_for_nonexistent_id(self):
        """Test that delete_todo returns False for non-existent IDs."""
        success = self.manager.delete_todo(999)
        self.assertFalse(success)

    def test_mark_complete_marks_todo_as_complete(self):
        """Test that mark_complete marks a todo as complete."""
        todo = self.manager.add_todo("Test Todo")
        self.assertFalse(todo.completed)

        success = self.manager.mark_complete(todo.id)

        self.assertTrue(success)
        updated_todo = self.manager.get_todo_by_id(todo.id)
        self.assertTrue(updated_todo.completed)

    def test_mark_incomplete_marks_todo_as_incomplete(self):
        """Test that mark_incomplete marks a todo as incomplete."""
        todo = self.manager.add_todo("Test Todo")
        # First mark it as complete
        self.manager.mark_complete(todo.id)
        self.assertTrue(self.manager.get_todo_by_id(todo.id).completed)

        success = self.manager.mark_incomplete(todo.id)

        self.assertTrue(success)
        updated_todo = self.manager.get_todo_by_id(todo.id)
        self.assertFalse(updated_todo.completed)

    def test_mark_complete_returns_false_for_nonexistent_id(self):
        """Test that mark_complete returns False for non-existent IDs."""
        success = self.manager.mark_complete(999)
        self.assertFalse(success)

    def test_mark_incomplete_returns_false_for_nonexistent_id(self):
        """Test that mark_incomplete returns False for non-existent IDs."""
        success = self.manager.mark_incomplete(999)
        self.assertFalse(success)

    def test_todo_ids_are_unique_and_incremental(self):
        """Test that todo IDs are unique and increment properly."""
        todo1 = self.manager.add_todo("First Todo")
        todo2 = self.manager.add_todo("Second Todo")
        todo3 = self.manager.add_todo("Third Todo")

        self.assertEqual(todo1.id, 1)
        self.assertEqual(todo2.id, 2)
        self.assertEqual(todo3.id, 3)

        # Delete one and add another, ID should continue incrementing
        self.manager.delete_todo(todo2.id)
        todo4 = self.manager.add_todo("Fourth Todo")

        self.assertEqual(todo4.id, 4)


if __name__ == '__main__':
    unittest.main()