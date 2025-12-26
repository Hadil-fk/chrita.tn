import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemperatureCard, HumidityCard, RainCard, DryStatusCard } from "@/components/SensorCard";
import SmartAlert, { Alert } from "@/components/SmartAlert";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchSensorData } from "@/services/sensor.service";
import { Sensor } from "@/types";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sensorData, setSensorData] = useState<Sensor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  /**
   * Update time every second
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Fetch sensor data from the backend
   * This function is called on mount and when manually refreshing
   */
  const loadSensorData = async () => {
    try {
      const data = await fetchSensorData();
      setSensorData(data);
      
      // Generate alerts based on sensor data
      const newAlerts: Alert[] = [];
      if (data.rain) {
        newAlerts.push({
          id: "rain-alert",
          type: "rain",
          message: "Rain detected! Consider bringing your laundry inside.",
          time: "Just now",
        });
      }
      if (data.humidity > 80) {
        newAlerts.push({
          id: "humidity-alert",
          type: "warning",
          message: "High humidity detected. Drying may take longer.",
          time: "Just now",
        });
      }
      if (data.laundryStatus === "dry") {
        newAlerts.push({
          id: "dry-alert",
          type: "dry",
          message: "Your laundry is ready to collect!",
          time: "Just now",
        });
      }
      setAlerts(newAlerts);
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch sensor data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Polling: Fetch sensor data every 5 seconds
   * This keeps the dashboard updated in real-time
   * 
   * Alternative: WebSockets (Socket.io) would be more efficient for real-time updates
   * See explanation in comments below
   */
  useEffect(() => {
    // Initial load
    loadSensorData();

    // Set up polling interval (fetch every 5 seconds)
    const pollingInterval = setInterval(() => {
      loadSensorData();
    }, 5000); // 5000ms = 5 seconds

    // Cleanup: clear interval when component unmounts
    return () => clearInterval(pollingInterval);
  }, []);

  /**
   * Manual refresh handler
   * Allows users to manually refresh sensor data
   */
  const handleRefresh = async () => {
    setIsLoading(true);
    await loadSensorData();
    toast({
      title: "Refreshed",
      description: "Sensor data has been updated.",
    });
  };

  /**
   * Dismiss alert handler
   */
  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  /**
   * WebSockets Alternative (Socket.io) - Explanation:
   * 
   * Instead of polling every 5 seconds, you could use WebSockets for real-time updates:
   * 
   * 1. Install socket.io-client: npm install socket.io-client
   * 2. In your backend, set up Socket.io server
   * 3. In Dashboard component:
   * 
   *    import { io } from 'socket.io-client';
   *    
   *    useEffect(() => {
   *      const socket = io('http://localhost:8080');
   *      
   *      socket.on('sensor-update', (data: Sensor) => {
   *        setSensorData(data);
   *      });
   *      
   *      return () => socket.disconnect();
   *    }, []);
   * 
   * Advantages of WebSockets:
   * - Instant updates (no delay)
   * - More efficient (no unnecessary requests)
   * - Server can push updates when data changes
   * 
   * Advantages of Polling:
   * - Simpler to implement
   * - Works with any HTTP server
   * - No need for WebSocket server setup
   */

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor your laundry conditions in real-time
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="gap-2 pointer-events-auto cursor-pointer whitespace-nowrap" 
            type="button"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Loading..." : "Refresh Data"}
          </Button>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Smart Alerts</h2>
            <SmartAlert alerts={alerts} onDismiss={handleDismissAlert} />
          </div>
        )}

        {/* Time Card */}
        <Card variant="glass" className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-4xl font-bold text-foreground">{formatTime(currentTime)}</p>
                <p className="text-muted-foreground">{formatDate(currentTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sensor Cards Grid */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Sensor Readings</h2>
        {isLoading && !sensorData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
          </div>
        ) : sensorData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <TemperatureCard value={Math.round(sensorData.temperature)} />
            <HumidityCard value={Math.round(sensorData.humidity)} />
            <RainCard isRaining={sensorData.rain} />
            <DryStatusCard isDry={sensorData.laundryStatus === "dry"} />
          </div>
        ) : (
          <Card variant="glass" className="mb-8">
            <CardContent className="p-6 text-center text-muted-foreground">
              No sensor data available. Please check your connection.
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Drying Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              {sensorData ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Weather</span>
                    <span className={`font-medium ${sensorData.rain ? "text-accent" : "text-success"}`}>
                      {sensorData.rain ? "Poor - Raining" : "Excellent"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Humidity Level</span>
                    <span className={`font-medium ${sensorData.humidity > 60 ? "text-accent" : "text-success"}`}>
                      {sensorData.humidity > 60 ? "High" : sensorData.humidity > 30 ? "Normal" : "Low"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Laundry Status</span>
                    <span className="font-medium text-foreground capitalize">
                      {sensorData.laundryStatus || "Unknown"}
                    </span>
                  </div>
                  {sensorData.createdAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium text-foreground text-sm">
                        {new Date(sensorData.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {sensorData ? (
                <ul className="space-y-3">
                  {sensorData.rain && (
                    <li className="flex items-start gap-2 text-accent">
                      <span className="w-2 h-2 rounded-full bg-accent mt-2" />
                      <span>Rain detected! Bring laundry inside.</span>
                    </li>
                  )}
                  {sensorData.humidity > 60 && (
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                      <span>High humidity may slow drying.</span>
                    </li>
                  )}
                  {sensorData.laundryStatus === "dry" && (
                    <li className="flex items-start gap-2 text-success">
                      <span className="w-2 h-2 rounded-full bg-success mt-2" />
                      <span>Your laundry is ready to collect!</span>
                    </li>
                  )}
                  {!sensorData.rain && sensorData.laundryStatus !== "dry" && sensorData.humidity <= 60 && (
                    <li className="flex items-start gap-2 text-success">
                      <span className="w-2 h-2 rounded-full bg-success mt-2" />
                      <span>Perfect drying conditions!</span>
                    </li>
                  )}
                </ul>
              ) : (
                <div className="text-center text-muted-foreground">No recommendations available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
