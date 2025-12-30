/**
 * Axios Configuration for API Requests
 * 
 * This file configures axios with:
 * - Base URL for all API requests
 * - JWT token interceptor to automatically attach tokens to requests
 * - Error handling interceptor
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";

// Base URL for the backend API
// Must match the backend server port (default: 8080)
const BASE_URL = "https://chrita-tn.onrender.com/";

/**
 * Create axios instance with base configuration
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  // Axios automatically sets Content-Type to application/json for objects
  // But we'll ensure it's set in the interceptor
});

/**
 * Request Interceptor
 * Automatically attaches JWT token from localStorage to all requests
 * This ensures authenticated requests include the token in the Authorization header
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to the Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CRITICAL: Ensure Content-Type is set for requests with data
    // Axios automatically serializes objects to JSON, but we need to set the header
    if (config.data && config.headers) {
      // Only set Content-Type if it's not already set and data is an object
      if (!config.headers["Content-Type"] && typeof config.data === 'object') {
        config.headers["Content-Type"] = "application/json";
      }
    }

    // Debug logging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🚀 [Axios Request] ${config.method?.toUpperCase()} ${fullUrl}`);
    if (config.data) {
      // Don't log password in production
      const logData = { ...config.data };
      if (logData.password) logData.password = "***";
      console.log(`📦 Request payload:`, JSON.stringify(logData, null, 2));
      console.log(`📋 Content-Type: ${config.headers?.["Content-Type"] || "not set"}`);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error(`❌ [Axios Request Error]`, error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common errors like 401 (Unauthorized) which means token is invalid/expired
 */
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    console.log(`✅ [Axios Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    // Enhanced error logging
    if (error.response) {
      // Server responded with error status
      console.error(`❌ [Axios Response Error] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error(`   Response data:`, error.response.data);
      console.error(`   Full URL: ${error.config?.baseURL}${error.config?.url}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error(`❌ [Axios Network Error] No response received`);
      console.error(`   Request URL: ${error.config?.baseURL}${error.config?.url}`);
      console.error(`   This usually means:`);
      console.error(`   1. Backend server is not running`);
      console.error(`   2. CORS is blocking the request`);
      console.error(`   3. Network/firewall is blocking the connection`);
      console.error(`   4. Wrong port or URL`);
    } else {
      // Error setting up the request
      console.error(`❌ [Axios Setup Error]`, error.message);
    }

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Remove invalid token from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("auth-user");
      
      // Redirect to login page (only if not already on login/signup page)
      if (window.location.pathname !== "/signin" && window.location.pathname !== "/signup") {
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

