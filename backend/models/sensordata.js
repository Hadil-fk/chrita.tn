const mongoose = require("mongoose");

const SensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  rain: Boolean,
  laundryStatus: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SensorData", SensorSchema);
