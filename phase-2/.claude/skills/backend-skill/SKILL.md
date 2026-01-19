---
name: backend-skill
description: Build backend functionality with API routes, request/response handling, and database connectivity.
---

# Backend Skill

## Instructions

1. **Route Generation**
   - Define clear RESTful routes (GET, POST, PUT, DELETE)
   - Organize routes by feature or resource
   - Use route parameters and query strings properly
   - Separate route definitions from route handlers

2. **Request/Response Handling**
   - Parse incoming request body (JSON, form-data)
   - Validate user inputs before processing
   - Handle errors gracefully and send meaningful responses
   - Use status codes appropriately (200, 201, 400, 404, 500)

3. **Database Connectivity**
   - Connect to database using ORM or native drivers
   - Perform CRUD operations
   - Handle database errors safely
   - Close connections properly or use connection pooling

4. **Middleware & Utilities**
   - Use middleware for authentication, logging, and validation
   - Implement CORS if API is accessed externally
   - Use environment variables for sensitive configurations
   - Handle async operations with proper error catching

## Best Practices
- Keep route handlers short and modular
- Use consistent response structure
- Avoid blocking operations in request handlers
- Sanitize all user inputs
- Follow RESTful conventions for API design

## Example Structure

```javascript
// Express.js Example
import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./db.js";
import User from "./models/User.js";

const app = express();
app.use(bodyParser.json());

// Connect to database
connectDB();

// Routes
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
