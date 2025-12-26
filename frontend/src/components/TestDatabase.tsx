import React, { useState, useEffect } from "react";
import axios from "axios";

const TestDatabase = () => {
  // Sign Up state
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Login state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Sensor data submission state
  const [sensorData, setSensorData] = useState({
    sensorId: "",
    temperature: "",
    humidity: "",
    timestamp: "",
  });

  // Latest sensor data state
  const [latestSensorData, setLatestSensorData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch latest sensor data on component mount
  useEffect(() => {
    fetchLatestSensorData();
  }, []);

  const fetchLatestSensorData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual API endpoint
      const response = await axios.get("/api/sensor-data/latest");
      setLatestSensorData(response.data);
    } catch (err) {
      setError("Failed to fetch latest sensor data");
      console.error("Error fetching sensor data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post("http://localhost:8080/api/auth/register", signUpData);
      setSuccessMessage("Sign up successful! You can now log in.");
      setSignUpData({ firstName: "", lastName: "", email: "", password: "" });
      console.log("Sign up response:", response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Sign up failed. Please try again.";
      setError(errorMessage);
      console.error("Sign up error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", loginData);
      
      // Extract JWT token from response (check common response formats)
      const token = response.data?.token || 
                   response.data?.accessToken || 
                   response.data?.jwt || 
                   response.data;
      
      if (token && typeof token === 'string') {
        // Store JWT token in localStorage
        localStorage.setItem('token', token);
        setSuccessMessage("Login successful! JWT token stored.");
      } else {
        // If token is in a nested object, try to find it
        const tokenFromData = response.data?.data?.token || response.data?.user?.token;
        if (tokenFromData) {
          localStorage.setItem('token', tokenFromData);
          setSuccessMessage("Login successful! JWT token stored.");
        } else {
          // Store the entire response data if token structure is unknown
          localStorage.setItem('token', JSON.stringify(response.data));
          setSuccessMessage("Login successful! Response data stored.");
        }
      }
      
      setLoginData({ email: "", password: "" });
      console.log("Login response:", response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSensorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // Replace with your actual API endpoint
      await axios.post("/api/sensor-data", sensorData);
      setSuccessMessage("Sensor data submitted successfully!");
      setSensorData({
        sensorId: "",
        temperature: "",
        humidity: "",
        timestamp: "",
      });
      // Refresh latest sensor data
      fetchLatestSensorData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit sensor data";
      setError(errorMessage);
      console.error("Sensor data submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Test Database</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Sign Up Section */}
      <section className="mb-8 p-4 border border-gray-300 rounded">
        <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
        <form onSubmit={handleSignUp} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              value={signUpData.firstName}
              onChange={(e) =>
                setSignUpData({ ...signUpData, firstName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              value={signUpData.lastName}
              onChange={(e) =>
                setSignUpData({ ...signUpData, lastName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={signUpData.email}
              onChange={(e) =>
                setSignUpData({ ...signUpData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={signUpData.password}
              onChange={(e) =>
                setSignUpData({ ...signUpData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </section>

      {/* Login Section */}
      <section className="mb-8 p-4 border border-gray-300 rounded">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>

      {/* Sensor Data Submission Section */}
      <section className="mb-8 p-4 border border-gray-300 rounded">
        <h2 className="text-xl font-semibold mb-4">Sensor Data Submission</h2>
        <form onSubmit={handleSensorSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Sensor ID</label>
            <input
              type="text"
              value={sensorData.sensorId}
              onChange={(e) =>
                setSensorData({ ...sensorData, sensorId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Temperature</label>
            <input
              type="number"
              value={sensorData.temperature}
              onChange={(e) =>
                setSensorData({ ...sensorData, temperature: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Humidity</label>
            <input
              type="number"
              value={sensorData.humidity}
              onChange={(e) =>
                setSensorData({ ...sensorData, humidity: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Timestamp</label>
            <input
              type="datetime-local"
              value={sensorData.timestamp}
              onChange={(e) =>
                setSensorData({ ...sensorData, timestamp: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Sensor Data"}
          </button>
        </form>
      </section>

      {/* Display Latest Sensor Data Section */}
      <section className="mb-8 p-4 border border-gray-300 rounded">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Display Latest Sensor Data</h2>
          <button
            onClick={fetchLatestSensorData}
            disabled={loading}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
        {loading && !latestSensorData ? (
          <p className="text-gray-600">Loading sensor data...</p>
        ) : latestSensorData ? (
          <div className="bg-gray-50 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(latestSensorData, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-gray-600">No sensor data available</p>
        )}
      </section>
    </div>
  );
};

export default TestDatabase;

