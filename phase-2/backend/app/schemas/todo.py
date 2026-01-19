from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class TodoBase(BaseModel):
    """Base schema for todo fields."""
    title: str = Field(..., min_length=1, max_length=255, description="Todo title")
    description: Optional[str] = Field(None, max_length=1000, description="Todo description")

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()


class CreateTodoInput(TodoBase):
    """Schema for creating a new todo."""
    pass


class UpdateTodoInput(BaseModel):
    """Schema for updating an existing todo."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    completed: Optional[bool] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip() if v else v


class TodoResponse(BaseModel):
    """Schema for todo response."""
    id: int
    user_id: str = Field(alias="userId")
    title: str
    description: Optional[str] = None
    completed: bool
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str
    code: Optional[str] = None
