# React-Backend Integration Guide

This guide explains how the React frontend is connected to the Node.js/Express backend for the Chrita.tn project.

## 📁 Folder Structure

```
chrita-smart-laundry/src/
├── api/
│   └── api.ts                 # Axios configuration with JWT interceptor
├── services/
│   ├── auth.service.ts        # Authentication API calls
│   └── sensor.service.ts      # Sensor data API calls
├── types/
│   └── index.ts              # TypeScript interfaces (User, Sensor, etc.)
├── contexts/
│   └── AuthContext.tsx       # Updated to use real API calls
├── components/
│   └── ProtectedRoute.tsx   # Updated to check JWT token
└── pages/
    ├── Dashboard.tsx          # Updated with real-time sensor data polling
    ├── SignIn.tsx            # Uses real authentication
    └── SignUp.tsx            # Uses real authentication
```

## 🔧 Implementation Details

### 1. Axios Configuration (`src/api/api.ts`)

**Purpose**: Centralized API configuration with automatic JWT token handling.

**Features**:
- Base URL: `http://localhost:8080`
- Request interceptor: Automatically adds JWT token to all requests
- Response interceptor: Handles 401 errors (token expired) and redirects to login

**Usage**: Import `api` from this file instead of using axios directly.

### 2. TypeScript Interfaces (`src/types/index.ts`)

**Purpose**: Type safety and code documentation.

**Interfaces**:
- `User`: User data structure
- `Sensor`: Sensor data structure from ESP32
- `LoginRequest`: Login payload
- `SignUpRequest`: Signup payload
- `AuthResponse`: Authentication response with token

### 3. Authentication Service (`src/services/auth.service.ts`)

**Functions**:
- `signup()`: Register new user → POST `/api/auth/register`
- `login()`: Login user → POST `/api/auth/login` (stores JWT in localStorage)
- `logout()`: Remove token and user data
- `getCurrentUser()`: Get user from localStorage
- `getToken()`: Get JWT token
- `isAuthenticated()`: Check if user has valid token

### 4. Sensor Service (`src/services/sensor.service.ts`)

**Functions**:
- `fetchSensorData()`: Get latest sensor data → GET `/api/sensors`
- `submitSensorData()`: Send new sensor data → POST `/api/sensors`

### 5. AuthContext (`src/contexts/AuthContext.tsx`)

**Updates**:
- Uses real API calls via `auth.service.ts`
- Stores JWT token in localStorage on login
- Loads user from localStorage on mount
- Provides authentication state to entire app

### 6. ProtectedRoute (`src/components/ProtectedRoute.tsx`)

**Updates**:
- Checks JWT token from localStorage
- Verifies authentication state from AuthContext
- Redirects to `/signin` if not authenticated

### 7. Dashboard (`src/pages/Dashboard.tsx`)

**Updates**:
- Fetches real sensor data from backend
- Implements **polling** (fetches every 5 seconds)
- Displays loading states
- Shows error messages if API calls fail
- Includes comments explaining WebSocket alternative

## 🔄 Real-Time Updates: Polling vs WebSockets

### Current Implementation: Polling

**How it works**:
- Dashboard fetches sensor data every 5 seconds using `setInterval`
- Simple HTTP GET requests to `/api/sensors`

**Pros**:
- ✅ Simple to implement
- ✅ Works with any HTTP server
- ✅ No additional server setup needed

**Cons**:
- ❌ Slight delay (up to 5 seconds)
- ❌ More server requests
- ❌ Not truly "real-time"

### Alternative: WebSockets (Socket.io)

**How it works**:
- Persistent connection between client and server
- Server pushes updates immediately when data changes
- No polling needed

**Pros**:
- ✅ Instant updates
- ✅ More efficient (fewer requests)
- ✅ True real-time communication

**Cons**:
- ❌ Requires WebSocket server setup
- ❌ More complex implementation
- ❌ Additional dependency (socket.io-client)

**Implementation Example** (commented in Dashboard.tsx):

```typescript
import { io } from 'socket.io-client';

useEffect(() => {
      const socket = io('http://localhost:8080');
  
  socket.on('sensor-update', (data: Sensor) => {
    setSensorData(data);
  });
  
  return () => socket.disconnect();
}, []);
```

## 🔐 Authentication Flow

1. **Sign Up**:
   - User fills form → `signup()` service → POST `/api/auth/register`
   - On success → automatically logs in → stores JWT token

2. **Login**:
   - User fills form → `login()` service → POST `/api/auth/login`
   - Backend returns JWT token → stored in localStorage
   - User data stored in localStorage

3. **Protected Routes**:
   - `ProtectedRoute` checks for JWT token
   - If token exists → allow access
   - If no token → redirect to `/signin`

4. **API Requests**:
   - Axios interceptor automatically adds `Authorization: Bearer <token>` header
   - Backend validates token on each request

5. **Logout**:
   - Removes token and user data from localStorage
   - Redirects to sign-in page

## 🚀 Usage Examples

### Using Authentication Service

```typescript
import { login, signup } from "@/services/auth.service";

// Login
try {
  await login({ email: "user@example.com", password: "password123" });
  // Token automatically stored in localStorage
} catch (error) {
  console.error("Login failed:", error.message);
}

// Signup
try {
  await signup({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password123"
  });
} catch (error) {
  console.error("Signup failed:", error.message);
}
```

### Using Sensor Service

```typescript
import { fetchSensorData, submitSensorData } from "@/services/sensor.service";

// Fetch latest sensor data
try {
  const data = await fetchSensorData();
  console.log("Temperature:", data.temperature);
  console.log("Humidity:", data.humidity);
} catch (error) {
  console.error("Failed to fetch:", error.message);
}

// Submit new sensor data
try {
  await submitSensorData({
    temperature: 25,
    humidity: 60,
    rain: false,
    laundryStatus: "drying"
  });
} catch (error) {
  console.error("Failed to submit:", error.message);
}
```

### Using AuthContext

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (isAuthenticated) {
    return <div>Welcome, {user?.firstName}!</div>;
  }
  
  return <div>Please log in</div>;
}
```

## 🔧 Configuration

### Backend URL

Update the base URL in `src/api/api.ts` if your backend runs on a different port:

```typescript
const BASE_URL = "http://localhost:8080"; // Change this if needed
```

### Polling Interval

Change the polling interval in `src/pages/Dashboard.tsx`:

```typescript
const pollingInterval = setInterval(() => {
  loadSensorData();
}, 5000); // Change 5000 to desired milliseconds
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)

### Sensors
- `GET /api/sensors` - Get latest sensor data
- `POST /api/sensors` - Submit new sensor data

## ✅ Testing Checklist

- [ ] Backend is running on `http://localhost:8080`
- [ ] MongoDB is connected
- [ ] User can sign up
- [ ] User can log in
- [ ] JWT token is stored in localStorage
- [ ] Protected routes require authentication
- [ ] Dashboard displays sensor data
- [ ] Sensor data updates every 5 seconds (polling)
- [ ] Error messages display correctly

## 🐛 Troubleshooting

### "Failed to fetch sensor data"
- Check if backend is running
- Verify MongoDB connection
- Check browser console for CORS errors

### "401 Unauthorized"
- Token expired or invalid
- Clear localStorage and log in again
- Check if token is being sent in headers

### "CORS error"
- Backend must have CORS enabled
- Check `backend/server.js` for `app.use(cors())`

### Polling not working
- Check browser console for errors
- Verify API endpoint is correct
- Check network tab in DevTools

## 📚 Next Steps

1. **Add WebSocket Support**: Implement Socket.io for true real-time updates
2. **Add Token Refresh**: Implement refresh token mechanism
3. **Add Error Boundaries**: Better error handling for API failures
4. **Add Loading States**: Improve UX with skeleton loaders
5. **Add Data Validation**: Validate sensor data before submission

