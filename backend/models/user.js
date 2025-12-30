const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    minlength: 6
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true
  }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
