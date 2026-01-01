"""
Unit tests for the Todo model.
"""
import unittest
from src.models.todo import Todo


class TestTodo(unittest.TestCase):
    """Test cases for the Todo model."""

    def test_todo_creation_with_required_fields(self):
        """Test creating a Todo with required fields."""
        todo = Todo(id=1, title="Test Todo")
        self.assertEqual(todo.id, 1)
        self.assertEqual(todo.title, "Test Todo")
        self.assertEqual(todo.description, "")
        self.assertEqual(todo.completed, False)

    def test_todo_creation_with_all_fields(self):
        """Test creating a Todo with all fields."""
        todo = Todo(id=1, title="Test Todo", description="Test description", completed=True)
        self.assertEqual(todo.id, 1)
        self.assertEqual(todo.title, "Test Todo")
        self.assertEqual(todo.description, "Test description")
        self.assertEqual(todo.completed, True)

    def test_todo_creation_fails_with_empty_title(self):
        """Test that creating a Todo with empty title raises ValueError."""
        with self.assertRaises(ValueError):
            Todo(id=1, title="")

        with self.assertRaises(ValueError):
            Todo(id=1, title="   ")  # whitespace-only title

        with self.assertRaises(ValueError):
            Todo(id=1, title="")

    def test_todo_str_representation(self):
        """Test string representation of Todo."""
        todo = Todo(id=1, title="Test Todo", description="Test description", completed=True)
        expected = "[X] 1. Test Todo - Test description"
        self.assertEqual(str(todo), expected)

        todo_incomplete = Todo(id=2, title="Incomplete Todo", completed=False)
        expected_incomplete = "[O] 2. Incomplete Todo - "
        self.assertEqual(str(todo_incomplete), expected_incomplete)

    def test_todo_repr_representation(self):
        """Test detailed string representation of Todo."""
        todo = Todo(id=1, title="Test Todo", description="Test description", completed=True)
        expected = "Todo(id=1, title='Test Todo', description='Test description', completed=True)"
        self.assertEqual(repr(todo), expected)

    def test_todo_to_dict(self):
        """Test converting Todo to dictionary."""
        todo = Todo(id=1, title="Test Todo", description="Test description", completed=True)
        expected_dict = {
            "id": 1,
            "title": "Test Todo",
            "description": "Test description",
            "completed": True
        }
        self.assertEqual(todo.to_dict(), expected_dict)

    def test_todo_from_dict(self):
        """Test creating Todo from dictionary."""
        data = {
            "id": 1,
            "title": "Test Todo",
            "description": "Test description",
            "completed": True
        }
        todo = Todo.from_dict(data)
        self.assertEqual(todo.id, 1)
        self.assertEqual(todo.title, "Test Todo")
        self.assertEqual(todo.description, "Test description")
        self.assertEqual(todo.completed, True)

    def test_todo_from_dict_optional_fields(self):
        """Test creating Todo from dictionary with optional fields missing."""
        data = {
            "id": 1,
            "title": "Test Todo"
        }
        todo = Todo.from_dict(data)
        self.assertEqual(todo.id, 1)
        self.assertEqual(todo.title, "Test Todo")
        self.assertEqual(todo.description, "")
        self.assertEqual(todo.completed, False)


if __name__ == '__main__':
    unittest.main()