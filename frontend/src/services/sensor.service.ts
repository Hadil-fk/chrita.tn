/**
 * Sensor Service
 * 
 * This service handles all sensor-related API calls:
 * - Fetch latest sensor data from the backend
 * - Submit new sensor data to the backend
 */

import api from "@/api/api";
import { Sensor } from "@/types";

/**
 * Fetch the latest sensor data from the backend
 * 
 * This endpoint returns the most recent sensor reading from the database
 * 
 * @returns Promise that resolves with the latest Sensor data
 * @throws Error if fetch fails
 */
export const fetchSensorData = async (): Promise<Sensor> => {
  try {
    const response = await api.get<Sensor>("/api/sensors");
    return response.data;
  } catch (error: any) {
    // Extract error message from response or use default
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch sensor data";
    throw new Error(errorMessage);
  }
};

/**
 * Submit new sensor data to the backend
 * 
 * This endpoint is typically called by the ESP32 device to send sensor readings
 * 
 * @param sensorData - Sensor reading data (temperature, humidity, rain, laundryStatus)
 * @returns Promise that resolves when data is saved successfully
 * @throws Error if submission fails
 */
export const submitSensorData = async (sensorData: Omit<Sensor, "_id" | "createdAt" | "updatedAt">): Promise<Sensor> => {
  try {
    const response = await api.post<{ message: string; data: Sensor }>("/api/sensors", sensorData);
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response or use default
    const errorMessage = error.response?.data?.message || error.message || "Failed to submit sensor data";
    throw new Error(errorMessage);
  }
};


