# Todo Console Application API Contract

## Overview
This document defines the interface contracts for the Todo Console Application operations.

## Operations

### 1. Add Todo
- **Action**: Create a new todo item
- **Input**: title (string, required), description (string, optional)
- **Output**: Todo object with assigned ID
- **Validation**: Title must not be empty
- **Success Response**: Todo created successfully with unique ID
- **Error Response**: Error message if validation fails

### 2. List Todos
- **Action**: Retrieve all todos
- **Input**: None
- **Output**: List of Todo objects with ID, title, description, and status
- **Success Response**: Formatted list of all todos
- **Error Response**: Error message if no todos exist

### 3. Update Todo
- **Action**: Modify an existing todo
- **Input**: ID (integer), new title (string, optional), new description (string, optional)
- **Output**: Updated Todo object
- **Validation**: Todo with given ID must exist
- **Success Response**: Todo updated successfully
- **Error Response**: Error message if ID not found

### 4. Delete Todo
- **Action**: Remove a todo by ID
- **Input**: ID (integer)
- **Output**: Confirmation of deletion
- **Validation**: Todo with given ID must exist
- **Success Response**: Todo deleted successfully
- **Error Response**: Error message if ID not found

### 5. Mark Todo Complete
- **Action**: Change todo status to complete
- **Input**: ID (integer)
- **Output**: Updated Todo object
- **Validation**: Todo with given ID must exist
- **Success Response**: Todo marked as complete
- **Error Response**: Error message if ID not found

### 6. Mark Todo Incomplete
- **Action**: Change todo status to incomplete
- **Input**: ID (integer)
- **Output**: Updated Todo object
- **Validation**: Todo with given ID must exist
- **Success Response**: Todo marked as incomplete
- **Error Response**: Error message if ID not found