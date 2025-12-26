const express = require("express");
const SensorData = require("../models/sensordata"); // modèle SensorData

const router = express.Router();

// -------- ESP32 ENVOIE DES DONNÉES --------
router.post("/", async (req, res) => {
  try {
    const { temperature, humidity, rain, laundryStatus } = req.body;

    const sensorData = await SensorData.create({
      temperature,
      humidity,
      rain,
      laundryStatus
    });

    res.json({ message: "Data saved", data: sensorData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -------- DASHBOARD LIT LA DERNIÈRE LECTURE --------
router.get("/", async (req, res) => {
  try {
    const latestData = await SensorData.find().sort({ createdAt: -1 }).limit(1);
    res.json(latestData[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
