const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

// -------- SIGN UP --------
router.post("/signup", async (req, res) => {
  console.log("📝 Signup route hit!");
  console.log("Request body:", req.body);
  console.log("Body type:", typeof req.body);
  console.log("Body keys:", Object.keys(req.body || {}));

  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !email || !password) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["firstName", "email", "password"],
        received: { firstName: !!firstName, lastName: !!lastName, email: !!email, password: !!password }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : "",
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    res.status(201).json({ 
      message: "User created successfully",
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// -------- LOGIN --------
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if user has a password (not Google-only user)
    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google sign-in. Please sign in with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ 
      token, 
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -------- GOOGLE OAUTH --------
router.post("/google", async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Email not provided by Google" });
    }

    // Check if user exists with this email
    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      // User exists - update googleId if not set, or just login
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

      return res.json({
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    } else {
      // New user - create account
      user = await User.create({
        firstName: firstName || "User",
        lastName: lastName || "",
        email: email.toLowerCase().trim(),
        googleId: googleId,
        // No password for Google users
      });

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

      return res.status(201).json({
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    }
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(500).json({ message: error.message || "Google authentication failed" });
  }
});

module.exports = router;
