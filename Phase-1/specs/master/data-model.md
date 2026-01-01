# Data Model: Todo Console Application

## Entity: Todo

### Fields
- **id**: int (unique identifier, auto-generated)
- **title**: str (required, non-empty)
- **description**: str (optional, can be empty)
- **completed**: bool (default: False)

### Validation Rules
- ID must be unique within the application
- Title must be provided and not empty
- ID must be a positive integer

### State Transitions
- **incomplete** → **complete**: When user marks todo as complete
- **complete** → **incomplete**: When user marks todo as incomplete

## Entity: TodoManager

### Responsibilities
- Store and manage collection of Todo objects
- Generate unique IDs for new todos
- Provide CRUD operations for todos
- Validate todo data before operations

### Internal Storage
- **todos**: list of Todo objects, indexed by ID for efficient access