from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class Todo(SQLModel, table=True):
    """Todo model - represents a task item owned by a user."""

    __tablename__ = "todos"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="Unique identifier"
    )
    user_id: str = Field(
        index=True,
        nullable=False,
        description="Owner reference (from Better Auth JWT)"
    )
    title: str = Field(
        max_length=255,
        nullable=False,
        description="Task title"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Task details"
    )
    completed: bool = Field(
        default=False,
        description="Completion status"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last modification timestamp"
    )
