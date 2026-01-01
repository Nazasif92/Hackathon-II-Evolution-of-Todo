# Todo Console Application

A command-line based Todo application written in Python that stores all tasks in memory. The application allows users to add, view, update, delete, and mark todos as complete or incomplete.

## Features

- Add new todos with titles and optional descriptions
- View all todos with their status
- Update existing todos by ID
- Delete todos by ID
- Mark todos as complete or incomplete
- Command-line interface with easy navigation

## Requirements

- Python 3.13 or higher
- No external dependencies (uses Python standard library only)

## Installation

1. Clone or download the repository
2. Navigate to the project directory
3. The application is ready to run (no installation required)

## Usage

To run the application:

```bash
python src/cli/main.py
```

Follow the on-screen menu prompts to interact with the application.

## Project Structure

```
todo-spec/
├── src/                 # Source code
│   ├── models/          # Data models (Todo class)
│   ├── services/        # Business logic (TodoManager)
│   └── cli/             # Command-line interface
├── tests/               # Unit tests
│   └── unit/            # Unit test files
├── requirements.txt     # Project requirements
└── .gitignore          # Git ignore file
```

## Development

The project follows a modular architecture with clear separation of concerns:

- **Models**: Define data structures (Todo class)
- **Services**: Handle business logic (TodoManager)
- **CLI**: Handle user interface and input/output

## Testing

To run the unit tests:

```bash
python -m unittest discover tests/unit
```

## License

This project is open source and available under the MIT License.