# Fix for 404 Error on Sign Up

## Problems Found and Fixed

### 1. ✅ Model Import Case Sensitivity (FIXED)
**Problem**: `auth.routes.js` was importing `require("../models/User")` but the file is `user.js` (lowercase)
**Fix**: Changed to `require("../models/user")` to match the actual filename

### 2. ✅ Server Configuration Improvements (FIXED)
**Problem**: No debugging/logging, no default port fallback
**Fix**: 
- Added request logging middleware
- Added default port (5000) if PORT env variable is missing
- Added health check endpoint at `/`
- Added 404 handler to show which route was not found

### 3. ⚠️ Environment Variables (CHECK THIS)
**Problem**: Backend uses `process.env.PORT` but `.env` file might not exist or have wrong port
**Action Required**: 
1. Create `.env` file in `backend/` directory
2. Add: `PORT=8080`
3. Add: `MONGO_URI=mongodb://localhost:27017/chrita` (or your MongoDB connection string)
4. Add: `JWT_SECRET=your-secret-key-here`

## How to Verify the Fix

### Step 1: Check Backend Configuration
```bash
cd backend
# Make sure .env file exists with PORT=8080
cat .env  # or type .env on Windows
```

### Step 2: Start Backend Server
```bash
cd backend
node server.js
# or
npm start  # if you have a start script
```

You should see:
```
MongoDB connected successfully
Server running on port 8080
Health check: http://localhost:8080/
Auth routes: http://localhost:8080/api/auth/register
```

### Step 3: Test the Health Endpoint
Open browser or use curl:
```bash
curl http://localhost:8080/
```
Should return: `{"message":"Backend server is running","port":"8080"}`

### Step 4: Test the Register Endpoint
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"test123456"}'
```

### Step 5: Check Browser Console
When you try to sign up from React:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to sign up
4. Check the failed request - it should show the exact URL being called
5. Check the Console tab for any CORS errors

## Common Issues

### Issue: "Cannot find module '../models/user'"
**Solution**: Make sure the file `backend/models/user.js` exists

### Issue: "MongoDB connection failed"
**Solution**: 
1. Make sure MongoDB is running
2. Check `MONGO_URI` in `.env` file
3. Verify MongoDB connection string is correct

### Issue: "Server running on port 5000" (not 8080)
**Solution**: 
1. Check `.env` file has `PORT=8080`
2. Restart the server after changing `.env`

### Issue: CORS Error
**Solution**: The server already has `app.use(cors())` which should allow all origins. If you still get CORS errors, check:
1. Backend is actually running
2. Frontend is calling the correct URL
3. Browser console for exact error message

## Expected Request Flow

1. **Frontend**: `api.post("/api/auth/register", signUpData)`
   - Base URL: `http://localhost:8080`
   - Full URL: `http://localhost:8080/api/auth/register`

2. **Backend**: 
   - `app.use("/api/auth", ...)` mounts routes at `/api/auth`
   - `router.post("/register", ...)` creates `/register` route
   - Combined: `/api/auth/register` ✅

3. **Response**: Should return `{ message: "User created successfully" }`

## Debugging Tips

The updated `server.js` now logs all requests. When you make a request, you should see in the backend console:
```
POST /api/auth/register
```

If you don't see this log, the request isn't reaching the backend, which means:
- Backend isn't running
- Wrong port
- CORS blocking the request
- Network issue

## Next Steps

1. ✅ Restart your backend server
2. ✅ Verify it's running on port 8080
3. ✅ Test the health endpoint
4. ✅ Try signing up from React again
5. ✅ Check browser console and network tab for errors


