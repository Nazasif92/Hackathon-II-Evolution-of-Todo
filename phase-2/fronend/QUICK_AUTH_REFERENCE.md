# Quick Authentication Reference

## Using Authentication in Components

### Import the Auth Hook

```typescript
import { useAuth } from '@/lib/auth-context';
```

### Access Auth State and Methods

```typescript
function MyComponent() {
  const {
    user,              // Current user object or null
    isAuthenticated,   // Boolean: is user signed in?
    isLoading,         // Boolean: is auth check in progress?
    signin,            // Function to sign in
    signup,            // Function to sign up
    signout,           // Function to sign out
    refreshUser        // Function to refresh user data
  } = useAuth();

  // Your component logic
}
```

## Common Use Cases

### 1. Display User Information

```typescript
function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>Please sign in</p>;
  }

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Name: {user.name || 'Not provided'}</p>
    </div>
  );
}
```

### 2. Sign In Form

```typescript
function SignInForm() {
  const { signin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signin(email, password);

    if (result.error) {
      setError(result.error);
    } else {
      // Success - user will be redirected
      router.push('/todos');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### 3. Sign Up Form

```typescript
function SignUpForm() {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signup(
      formData.email,
      formData.password,
      formData.name // Optional
    );

    if (result.error) {
      setError(result.error);
    } else {
      // Success - user is automatically signed in
      router.push('/todos');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name (optional)"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### 4. Sign Out Button

```typescript
function SignOutButton() {
  const { signout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signout(); // Automatically redirects to /signin
  };

  return (
    <button onClick={handleSignOut} disabled={loading}>
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
```

### 5. Protected Component

```typescript
function ProtectedContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null; // Or redirect happens
  }

  return (
    <div>
      <h1>Protected Content</h1>
      {/* Your protected content here */}
    </div>
  );
}
```

### 6. Conditional Rendering Based on Auth

```typescript
function Navigation() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav>
      <Link href="/">Home</Link>

      {isAuthenticated ? (
        <>
          <Link href="/todos">My Todos</Link>
          <span>Welcome, {user?.email}</span>
          <SignOutButton />
        </>
      ) : (
        <>
          <Link href="/signin">Sign In</Link>
          <Link href="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
}
```

### 7. Refresh User Data

```typescript
function UserProfile() {
  const { user, refreshUser } = useAuth();

  const handleRefresh = async () => {
    await refreshUser(); // Fetches latest user data from backend
  };

  return (
    <div>
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <button onClick={handleRefresh}>Refresh Profile</button>
    </div>
  );
}
```

## Making Authenticated API Calls

The API client automatically includes the JWT token in all requests:

```typescript
import { api } from '@/lib/api';

async function fetchUserTodos() {
  try {
    // Token is automatically attached
    const todos = await api.getTodos();
    return todos;
  } catch (error) {
    // 401 errors automatically redirect to /signin
    console.error('Failed to fetch todos:', error);
  }
}
```

## Direct API Access (Without api.ts)

If you need to make custom API calls:

```typescript
import { getAuthToken } from '@/lib/auth-api';

async function customApiCall() {
  const token = getAuthToken();

  const response = await fetch('http://localhost:8000/api/custom', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    // Handle unauthorized
    clearAuthToken();
    router.push('/signin');
  }

  return response.json();
}
```

## User Type

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}
```

## Auth Result Type

All auth operations return this type:

```typescript
interface AuthResult<T> {
  data?: T;      // Success: contains the data (User object)
  error?: string; // Failure: contains error message
}

// Usage
const result = await signin(email, password);

if (result.error) {
  // Handle error
  console.error(result.error);
} else if (result.data) {
  // Handle success
  console.log('Signed in user:', result.data);
}
```

## Loading States

```typescript
function MyComponent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <div>Content loaded</div>;
}
```

## Environment Variables

Make sure `NEXT_PUBLIC_API_URL` is set in your `.env` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Backend Endpoints

The frontend communicates with these backend endpoints:

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Login and get JWT token
- `POST /api/auth/signout` - Logout (optional)
- `GET /api/auth/me` - Get current user profile

## Token Storage

Tokens are stored in localStorage with the key `auth_token`.

**Access token manually:**

```typescript
import { getAuthToken, setAuthToken, clearAuthToken } from '@/lib/auth-api';

// Get token
const token = getAuthToken();

// Set token
setAuthToken('your-jwt-token-here');

// Clear token
clearAuthToken();
```

## Common Patterns

### Show loading, then content

```typescript
const { user, isLoading } = useAuth();

if (isLoading) return <LoadingSpinner />;
if (!user) return <SignInPrompt />;
return <Content user={user} />;
```

### Redirect if not authenticated

```typescript
const { isAuthenticated, isLoading } = useAuth();
const router = useRouter();

useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.push('/signin');
  }
}, [isAuthenticated, isLoading]);
```

### Show different UI for authenticated users

```typescript
const { isAuthenticated } = useAuth();

return (
  <div>
    {isAuthenticated ? (
      <AuthenticatedView />
    ) : (
      <GuestView />
    )}
  </div>
);
```

## Error Handling

```typescript
const { signin } = useAuth();
const [error, setError] = useState('');

const handleSignIn = async () => {
  try {
    const result = await signin(email, password);

    if (result.error) {
      // User-friendly error from backend
      setError(result.error);
    } else {
      // Success
      router.push('/dashboard');
    }
  } catch (err) {
    // Unexpected error
    setError('An unexpected error occurred');
    console.error(err);
  }
};
```

## Best Practices

1. **Always check `isLoading` before checking `isAuthenticated`**
   ```typescript
   if (isLoading) return <Loading />;
   if (!isAuthenticated) return <SignIn />;
   return <Content />;
   ```

2. **Use useEffect for redirects**
   ```typescript
   useEffect(() => {
     if (!isLoading && !isAuthenticated) {
       router.push('/signin');
     }
   }, [isAuthenticated, isLoading]);
   ```

3. **Handle errors gracefully**
   ```typescript
   const result = await signin(email, password);
   if (result.error) {
     setError(result.error); // Show to user
   }
   ```

4. **Don't expose sensitive data**
   ```typescript
   // Good
   console.log('User signed in:', user.email);

   // Bad
   console.log('Token:', getAuthToken());
   ```

5. **Clear errors on retry**
   ```typescript
   const handleSubmit = async () => {
     setError(''); // Clear previous error
     const result = await signin(email, password);
     // ...
   }
   ```
