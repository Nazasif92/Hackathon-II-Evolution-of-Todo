---
name: database-skill
description: Design and manage databases with table creation, migrations, and schema best practices.
---

# Database Skill

## Instructions

1. **Schema Design**
   - Identify entities and relationships
   - Define attributes with correct data types
   - Normalize tables to avoid redundancy
   - Use primary and foreign keys for relations

2. **Table Creation**
   - Use `CREATE TABLE` statements or ORM models
   - Define constraints (NOT NULL, UNIQUE, CHECK)
   - Use indexes for frequently queried columns
   - Maintain consistent naming conventions

3. **Migrations**
   - Use migration tools (e.g., Sequelize, TypeORM, Knex)
   - Version control database changes
   - Apply migrations to different environments safely
   - Rollback support for failed migrations

4. **Database Management**
   - Backup regularly
   - Optimize queries with indexes
   - Monitor table growth and performance
   - Ensure data integrity with constraints and validations

## Best Practices
- Keep table and column names meaningful
- Avoid storing sensitive data in plaintext
- Use timestamps for record tracking
- Follow consistent naming conventions for relationships
- Keep schema flexible for future changes

## Example Structure

```sql
-- Create Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Posts table with foreign key
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
