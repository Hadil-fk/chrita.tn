const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  googleId: { type: String, unique: true, sparse: true }
});

module.exports = mongoose.model("User", UserSchema);
