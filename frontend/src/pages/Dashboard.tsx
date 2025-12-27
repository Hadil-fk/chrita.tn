import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemperatureCard, HumidityCard, RainCard, DryStatusCard } from "@/components/SensorCard";
import SmartAlert, { Alert } from "@/components/SmartAlert";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sensor } from "@/types";
import { toast } from "@/hooks/use-toast";
// Import mqtt - use browser-compatible import
import mqtt, { MqttClient, IClientOptions } from "mqtt";

// MQTT Configuration
// Use HiveMQ Cloud WebSocket endpoint for browsers (path '/mqtt')
const MQTT_BROKER_URL = "wss://885e401cb7ed4660a1ea6ccd35904e81.s1.eu.hivemq.cloud:8884/mqtt";
const MQTT_USERNAME = "esp32";
const MQTT_PASSWORD = "Chrita1234";
const MQTT_TOPIC = "lingeconnect/live";

// Generate unique client ID for browser
const getClientId = () => {
  return `web-client-${Math.random().toString(16).substring(2, 10)}-${Date.now()}`;
};

// MQTT Message interface
interface MQTTMessage {
  temperature: number;
  humidity: number;
  isRaining: boolean;
}

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sensorData, setSensorData] = useState<Sensor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const mqttClientRef = useRef<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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
   * Generate alerts based on sensor data
   */
  const generateAlerts = (data: Sensor) => {
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
  };

  /**
   * Derive laundry status from sensor data
   */
  const deriveLaundryStatus = (temperature: number, humidity: number, isRaining: boolean): string => {
    if (isRaining) {
      return "wet";
    }
    if (humidity < 30 && temperature > 20) {
      return "dry";
    }
    if (humidity < 50) {
      return "drying";
    }
    return "wet";
  };

  /**
   * MQTT Connection and Subscription
   * Connects to HiveMQ Cloud and subscribes to sensor data topic
   */
  useEffect(() => {
    let client: MqttClient | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;

    const connectToBroker = () => {
      try {
        // MQTT connection options for browser WebSocket
        const options: IClientOptions = {
          username: MQTT_USERNAME,
          password: MQTT_PASSWORD,
          clientId: getClientId(),
          protocol: "wss",
          protocolVersion: 4, // MQTT 3.1.1
          clean: true,
          // Browser auto-reconnect interval
          reconnectPeriod: 5000, // 5 seconds
          connectTimeout: 30000, // 30 seconds connection timeout
          keepalive: 60, // Keep alive interval in seconds
          resubscribe: true, // Automatically resubscribe on reconnect
        };

        console.log("🔌 Attempting to connect to MQTT broker...", MQTT_BROKER_URL);
        client = mqtt.connect(MQTT_BROKER_URL, options);
        mqttClientRef.current = client;

        // Handle successful connection
        client.on("connect", (packet) => {
          console.log("✅ Connected to MQTT broker", packet);
          setIsConnected(true);
          setIsLoading(false);
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection

          // Subscribe to the sensor data topic
          client?.subscribe(MQTT_TOPIC, { qos: 0 }, (err, granted) => {
            if (err) {
              console.error("❌ Failed to subscribe to topic:", err);
              toast({
                title: "Subscription Error",
                description: `Failed to subscribe to ${MQTT_TOPIC}: ${err.message}`,
                variant: "destructive",
              });
            } else {
              console.log(`✅ Subscribed to topic: ${MQTT_TOPIC}`, granted);
              toast({
                title: "Connected",
                description: `Successfully connected and subscribed to ${MQTT_TOPIC}`,
              });
            }
          });
        });

        // Handle incoming messages
        client.on("message", (topic, message, packet) => {
          try {
            if (topic === MQTT_TOPIC) {
              const messageString = message.toString();
              console.log("📨 Received message:", messageString);
              
              const mqttData: MQTTMessage = JSON.parse(messageString);
              
              // Validate message structure
              if (
                typeof mqttData.temperature !== "number" ||
                typeof mqttData.humidity !== "number" ||
                typeof mqttData.isRaining !== "boolean"
              ) {
                throw new Error("Invalid message format");
              }
              
              // Map MQTT message to Sensor interface
              const sensorData: Sensor = {
                temperature: mqttData.temperature,
                humidity: mqttData.humidity,
                rain: mqttData.isRaining,
                laundryStatus: deriveLaundryStatus(
                  mqttData.temperature,
                  mqttData.humidity,
                  mqttData.isRaining
                ),
                createdAt: new Date().toISOString(),
              };

              setSensorData(sensorData);
              generateAlerts(sensorData);
            }
          } catch (error) {
            console.error("❌ Error parsing MQTT message:", error);
            toast({
              title: "Parse Error",
              description: `Failed to parse sensor data: ${error instanceof Error ? error.message : "Unknown error"}`,
              variant: "destructive",
            });
          }
        });

        // Handle connection errors
        client.on("error", (error) => {
          console.error("❌ MQTT connection error:", error);
          setIsConnected(false);
          setIsLoading(false);
          
          const errorMessage = error.message || "Unknown error";
          toast({
            title: "Connection Error",
            description: `MQTT error: ${errorMessage}`,
            variant: "destructive",
          });
        });

        // Handle disconnection
        client.on("close", () => {
          console.log("⚠️ MQTT connection closed");
          setIsConnected(false);
        });

        // Handle offline event
        client.on("offline", () => {
          console.log("⚠️ MQTT client is offline");
          setIsConnected(false);
        });

        // Handle reconnect
        client.on("reconnect", () => {
          reconnectAttempts += 1;
          console.log(`🔄 Reconnecting... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`);

          if (reconnectAttempts >= maxReconnectAttempts) {
            console.error("❌ Max reconnect attempts reached");
            try { client?.end(true); } catch (e) { /* Ignore */ }
            setIsLoading(false);
            toast({
              title: "Connection Failed",
              description: "Unable to connect to MQTT broker after multiple attempts. Please refresh the page or check broker credentials.",
              variant: "destructive",
            });
          }
        });

        // Handle end event
        client.on("end", () => {
          console.log("🔌 MQTT client ended");
          setIsConnected(false);
        });

      } catch (error) {
        console.error("❌ Failed to create MQTT client:", error);
        setIsLoading(false);
        toast({
          title: "Connection Failed",
          description: `Failed to initialize MQTT client: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        });
      }
    };

    // Connect to broker
    connectToBroker();

    // Cleanup: disconnect when component unmounts
    return () => {
      if (client) {
        console.log("🔌 Cleaning up MQTT connection...");
        client.unsubscribe(MQTT_TOPIC);
        client.end(true); // Force disconnect
        mqttClientRef.current = null;
      }
    };
  }, []);

  /**
   * Manual refresh handler
   * Note: With MQTT, data comes automatically, but we can show a toast
   */
  const handleRefresh = () => {
    if (isConnected && mqttClientRef.current) {
      toast({
        title: "Connected",
        description: `Listening to ${MQTT_TOPIC}. Data will update automatically.`,
      });
    } else {
      toast({
        title: "Not Connected",
        description: "MQTT connection is not active. Please check your connection.",
        variant: "destructive",
      });
    }
  };

  /**
   * Dismiss alert handler
   */
  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

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
            {isLoading ? "Connecting..." : isConnected ? "MQTT Connected" : "MQTT Disconnected"}
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
