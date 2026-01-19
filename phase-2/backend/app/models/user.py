from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid


class User(SQLModel, table=True):
    """User model - represents a registered account holder."""

    __tablename__ = "users"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        description="Unique identifier from Better Auth"
    )
    email: str = Field(
        unique=True,
        index=True,
        nullable=False,
        max_length=255,
        description="User's email address"
    )
    name: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Display name (optional)"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp"
    )
