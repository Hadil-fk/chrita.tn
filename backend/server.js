const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
connectDB();

// CRITICAL: express.json() MUST come before any middleware that reads req.body
// This ensures the request body is parsed from JSON before we try to access it
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Enhanced CORS configuration - allow all localhost origins
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins (any port)
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Allow specific origins
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:8080"
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for development - restrict in production
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Type", "Authorization"]
}));

// Enhanced debug middleware - logs ALL requests including OPTIONS
// This runs AFTER express.json() so req.body is already parsed
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  console.log(`Content-Type: ${req.get('Content-Type')}`);
  
  // Now req.body should be parsed by express.json()
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    console.log("✅ Body parsed:", JSON.stringify(req.body, null, 2));
  } else {
    console.log("⚠️ Body is empty or undefined");
  }
  
  if (req.query && typeof req.query === 'object' && Object.keys(req.query).length > 0) {
    console.log("Query:", req.query);
  }
  next();
});

// Health check
app.get("/", (req, res) => res.json({ message: "Backend server running" }));

// Routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);
console.log("✅ Auth routes registered at /api/auth");
console.log("   Available endpoints:");
console.log("   - GET  /api/auth/test");
console.log("   - POST /api/auth/signup");
console.log("   - POST /api/auth/signin");
console.log("   - POST /api/auth/google");

const sensorRoutes = require("./routes/sensor.routes");
app.use("/api/sensors", sensorRoutes);
console.log("✅ Sensor routes registered at /api/sensors");

// 404 handler - should only hit if no route matches
app.use((req, res) => {
  console.log(`❌ 404 - No route matched: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: "Route not found", 
    path: req.path,
    method: req.method,
    availableRoutes: [
      "GET  /api/auth/test",
      "POST /api/auth/signup",
      "POST /api/auth/signin",
      "POST /api/auth/google"
    ]
  });
});

// Use PORT from env, otherwise default to 8080 to match frontend
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`📍 Test endpoint: http://localhost:${PORT}/api/auth/test`);
  console.log(`📍 Signup endpoint: http://localhost:${PORT}/api/auth/signup\n`);
});

// Verify server is listening
server.on('listening', () => {
  const address = server.address();
  console.log(`✅ Server is listening on ${address.address}:${address.port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`   Please stop the other process or change PORT in .env`);
  } else {
    console.error(`❌ Server error:`, error);
  }
  process.exit(1);
});
