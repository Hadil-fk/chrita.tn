# Troubleshooting 404 Error on Sign Up

## Issue Analysis

**Error**: "Sign up failed: Request failed with status code 404"

This means the backend route `/api/auth/register` is not being found.

## Possible Causes

1. **Backend not running on port 8080**
2. **Route path mismatch**
3. **Model import case sensitivity issue** (FIXED)
4. **Backend server not started**

## Verification Steps

### 1. Check Backend Port
The backend uses `process.env.PORT`. Make sure your `.env` file has:
```
PORT=8080
```

### 2. Verify Backend is Running
Check if the backend server is actually running:
- Look for console message: "Server running on port 8080"
- Check if MongoDB connection is successful

### 3. Test the Route Directly
Use Postman or curl to test:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"test123456"}'
```

### 4. Check Route Registration
The route should be registered as:
- Server mounts: `app.use("/api/auth", require("./routes/auth.routes.js"))`
- Route defines: `router.post("/register", ...)`
- Full path: `/api/auth/register`

## Fixes Applied

1. ✅ Fixed model import case: Changed `require("../models/User")` to `require("../models/user")`

## Next Steps

1. Ensure `.env` file exists with `PORT=8080`
2. Restart the backend server
3. Verify the server is listening on port 8080
4. Check browser console for the exact error URL


