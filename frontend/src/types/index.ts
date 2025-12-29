/**
 * TypeScript Interfaces for Chrita.tn Project
 * 
 * This file contains all the type definitions used throughout the application
 * to ensure type safety and better code documentation.
 */

/**
 * User interface representing a user in the system
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // Legacy field for backward compatibility
  name?: string;
}

/**
 * Sensor Data interface representing sensor readings from the ESP32
 */
export interface Sensor {
  _id?: string;
  temperature: number;      // Temperature in Celsius
  humidity: number;          // Humidity percentage (0-100)
  rain: boolean;            // Whether it's raining
  laundryStatus: string;    // Status of laundry (e.g., "dry", "wet", "drying")
  createdAt?: string;       // ISO timestamp when data was recorded
  updatedAt?: string;       // ISO timestamp when data was last updated
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Sign up request payload
 */
export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Authentication response from the backend
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * API Error response structure
 */
export interface ApiError {
  message: string;
  status?: number;
}


