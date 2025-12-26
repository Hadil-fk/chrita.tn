# Route Debugging Guide

## Current Configuration

### Frontend (React)
- Base URL: `http://localhost:8080` (in `src/api/api.ts`)
- Request: `api.post("/api/auth/register", signUpData)`
- **Full URL**: `http://localhost:8080/api/auth/register`

### Backend (Express)
- Server port: `process.env.PORT || 8080` (defaults to 8080)
- Route mounting: `app.use("/api/auth", require("./routes/auth.routes.js"))`
- Route definition: `router.post("/register", ...)`
- **Full path**: `/api/auth/register` ✅

## Debugging Steps

### 1. Verify Backend is Running
```bash
cd backend
node server.js
```

You should see:
```
✅ Auth routes registered at /api/auth
✅ Sensor routes registered at /api/sensors
Server running on port 8080
```

### 2. Test Health Endpoint
```bash
curl http://localhost:8080/
```
Expected: `{"message":"Backend server is running","port":"8080"}`

### 3. Test Auth Routes Test Endpoint
```bash
curl http://localhost:8080/api/auth/test
```
Expected: `{"message":"Auth routes are working!","path":"/test"}`

### 4. Test Register Endpoint Directly
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"test123456"}'
```

### 5. Check Backend Console Logs
When you make a request, you should see:
```
[2024-01-01T12:00:00.000Z] POST /api/auth/register
Query: {}
Body: { firstName: 'Test', lastName: 'User', email: 'test@example.com', password: 'test123456' }
📝 Register route hit!
Request body: { firstName: 'Test', lastName: 'User', email: 'test@example.com', password: 'test123456' }
```

## Common Issues

### Issue: No logs appear in backend console
**Cause**: Request not reaching backend
**Solutions**:
1. Backend not running
2. Wrong port (check `.env` file)
3. CORS blocking (check browser console)
4. Network issue

### Issue: "Route not found" in 404 handler
**Cause**: Route path mismatch
**Check**:
1. Verify route is registered: Look for "✅ Auth routes registered"
2. Check the exact path in 404 response
3. Verify no typos in route paths

### Issue: Route registered but handler not called
**Cause**: Middleware blocking or route order issue
**Check**:
1. Verify middleware order in `server.js`
2. Check if CORS is blocking
3. Verify `express.json()` is before routes

## Expected Request Flow

1. **Frontend makes request**:
   ```
   POST http://localhost:8080/api/auth/register
   Content-Type: application/json
   Body: { firstName, lastName, email, password }
   ```

2. **Backend receives request**:
   - Debug middleware logs: `POST /api/auth/register`
   - CORS middleware allows request
   - Express.json() parses body
   - Route handler executes: `router.post("/register", ...)`

3. **Backend responds**:
   ```json
   { "message": "User created successfully" }
   ```

## Next Steps

1. ✅ Restart backend server
2. ✅ Test health endpoint
3. ✅ Test auth/test endpoint
4. ✅ Test register endpoint with curl
5. ✅ Try signup from React
6. ✅ Check backend console for logs
7. ✅ Check browser Network tab for exact URL


