"""Todos API router - CRUD operations for todo items."""
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_session
from app.auth.jwt import get_current_user, CurrentUser
from app.models.todo import Todo
from app.schemas.todo import (
    CreateTodoInput,
    UpdateTodoInput,
    TodoResponse,
)

router = APIRouter(prefix="/api/todos", tags=["todos"])


@router.get("", response_model=List[TodoResponse])
async def get_todos(
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> List[TodoResponse]:
    """
    Get all todos for the authenticated user.

    Returns todos filtered by user_id for data isolation.
    """
    statement = select(Todo).where(Todo.user_id == current_user.user_id).order_by(Todo.created_at.desc())
    result = await session.execute(statement)
    todos = result.scalars().all()
    return [TodoResponse.model_validate(todo) for todo in todos]


@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_input: CreateTodoInput,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> TodoResponse:
    """
    Create a new todo for the authenticated user.

    Automatically assigns user_id from the JWT token.
    """
    todo = Todo(
        user_id=current_user.user_id,
        title=todo_input.title,
        description=todo_input.description,
        completed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    session.add(todo)
    await session.commit()
    await session.refresh(todo)

    return TodoResponse.model_validate(todo)


async def get_todo_or_404(
    todo_id: int,
    current_user: CurrentUser,
    session: AsyncSession,
) -> Todo:
    """Helper to get a todo by ID with ownership check."""
    statement = select(Todo).where(Todo.id == todo_id)
    result = await session.execute(statement)
    todo = result.scalar_one_or_none()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found",
        )

    # T048: Ownership check - return 403 if not owner
    if todo.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this todo",
        )

    return todo


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> TodoResponse:
    """
    Get a single todo by ID.

    T065: Single todo fetch endpoint with ownership check.
    """
    todo = await get_todo_or_404(todo_id, current_user, session)
    return TodoResponse.model_validate(todo)


@router.patch("/{todo_id}/toggle", response_model=TodoResponse)
async def toggle_todo(
    todo_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> TodoResponse:
    """
    Toggle the completion status of a todo.

    Returns 403 if the user doesn't own the todo.
    """
    todo = await get_todo_or_404(todo_id, current_user, session)

    todo.completed = not todo.completed
    todo.updated_at = datetime.utcnow()

    session.add(todo)
    await session.commit()
    await session.refresh(todo)

    return TodoResponse.model_validate(todo)


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int,
    todo_input: UpdateTodoInput,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> TodoResponse:
    """
    Update a todo's title, description, or completion status.

    T052: Partial update - only provided fields are updated.
    T053: Ownership check - returns 403 if not owner.
    """
    todo = await get_todo_or_404(todo_id, current_user, session)

    # Apply partial updates
    if todo_input.title is not None:
        todo.title = todo_input.title
    if todo_input.description is not None:
        todo.description = todo_input.description
    if todo_input.completed is not None:
        todo.completed = todo_input.completed

    todo.updated_at = datetime.utcnow()

    session.add(todo)
    await session.commit()
    await session.refresh(todo)

    return TodoResponse.model_validate(todo)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """
    Delete a todo.

    T059: Delete endpoint.
    T060: Ownership check - returns 403 if not owner.
    """
    todo = await get_todo_or_404(todo_id, current_user, session)

    await session.delete(todo)
    await session.commit()
