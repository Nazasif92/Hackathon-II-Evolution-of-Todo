"""
Todo Model
Represents a single todo item with id, title, description, and completion status.
"""

class Todo:
    """
    A class representing a todo item.

    Attributes:
        id (int): Unique identifier for the todo
        title (str): Title of the todo (required)
        description (str): Optional description of the todo
        completed (bool): Completion status of the todo (default: False)
    """

    def __init__(self, id: int, title: str, description: str = "", completed: bool = False):
        """
        Initialize a Todo instance.

        Args:
            id (int): Unique identifier for the todo
            title (str): Title of the todo (required)
            description (str): Optional description of the todo
            completed (bool): Completion status of the todo (default: False)

        Raises:
            ValueError: If title is empty
        """
        self.id = self._validate_id(id)
        self.title = self._validate_title(title)
        self.description = description.strip() if description else ""
        self.completed = completed

    def _validate_id(self, id: int) -> int:
        """
        Validate the ID of the todo.

        Args:
            id (int): ID to validate

        Returns:
            int: Validated ID

        Raises:
            ValueError: If ID is not a positive integer
        """
        if not isinstance(id, int) or id <= 0:
            raise ValueError("ID must be a positive integer")
        return id

    def _validate_title(self, title: str) -> str:
        """
        Validate the title of the todo.

        Args:
            title (str): Title to validate

        Returns:
            str: Validated and stripped title

        Raises:
            ValueError: If title is empty after stripping
        """
        if not title or not title.strip():
            raise ValueError("Title cannot be empty")
        return title.strip()

    def __str__(self):
        """Return string representation of the todo."""
        status = "X" if self.completed else "O"
        return f"[{status}] {self.id}. {self.title} - {self.description}"

    def __repr__(self):
        """Return detailed string representation of the todo."""
        return f"Todo(id={self.id}, title='{self.title}', description='{self.description}', completed={self.completed})"

    def to_dict(self):
        """Convert the todo to a dictionary representation."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed
        }

    @classmethod
    def from_dict(cls, data):
        """Create a Todo instance from a dictionary."""
        return cls(
            id=data["id"],
            title=data["title"],
            description=data.get("description", ""),
            completed=data.get("completed", False)
        )