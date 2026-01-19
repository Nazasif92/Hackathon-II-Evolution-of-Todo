---
name: auth-skill
description: Implement secure authentication flows with signup, signin, password hashing, JWT tokens, and integration with modern auth systems.
---

# Authentication Skill

## Instructions

1. **User Registration (Signup)**
   - Collect username/email and password
   - Validate input (email format, password strength)
   - Hash password using bcrypt or Argon2
   - Store user in database securely

2. **User Login (Signin)**
   - Collect email/username and password
   - Validate input
   - Compare password with hashed password in database
   - Generate JWT token on successful login
   - Return token to user for subsequent requests

3. **JWT Tokens**
   - Use access token (short-lived) and refresh token (long-lived)
   - Include user ID and roles/permissions in token payload
   - Securely store secret key for signing
   - Validate token on protected routes

4. **Password Management**
   - Enforce strong password policies
   - Provide password reset flows via email
   - Hash new password before saving

5. **Better Auth Integration**
   - Support OAuth providers (Google, GitHub, etc.)
   - Use middleware to protect API routes
   - Rate-limit authentication attempts
   - Log suspicious login attempts

## Best Practices
- Never store plaintext passwords
- Use environment variables for secrets
- Keep JWT expiration short for access tokens
- Use HTTPS for all API requests
- Sanitize and validate all user inputs

## Example Structure

```javascript
// Signup example
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

async function signup(req, res) {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword });
  res.status(201).json({ message: "User registered successfully" });
}

// Signin example
async function signin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
}
