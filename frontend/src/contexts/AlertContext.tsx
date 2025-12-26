import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface GlobalAlert {
  id: string;
  type: "rain" | "dry" | "warning" | "info";
  message: string;
  timestamp: Date;
}

interface AlertContextType {
  alerts: GlobalAlert[];
  addAlert: (alert: Omit<GlobalAlert, "id" | "timestamp">) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<GlobalAlert[]>([]);

  // Simulate real-time sensor updates for demo
  useEffect(() => {
    const initialAlerts: GlobalAlert[] = [
      {
        id: "initial-1",
        type: "rain",
        message: "Rain detected! Consider bringing your laundry inside.",
        timestamp: new Date(),
      },
    ];
    setAlerts(initialAlerts);

    // Simulate random alerts every 30 seconds
    const interval = setInterval(() => {
      const randomEvents = [
        { type: "dry" as const, message: "Your laundry is dry and ready to collect!" },
        { type: "rain" as const, message: "Rain detected! Protect your laundry." },
        { type: "warning" as const, message: "High humidity levels detected." },
        { type: "info" as const, message: "Optimal drying conditions right now." },
      ];
      const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      
      // Only add if less than 3 alerts
      setAlerts((prev) => {
        if (prev.length < 3) {
          return [
            ...prev,
            {
              id: `alert-${Date.now()}`,
              ...randomEvent,
              timestamp: new Date(),
            },
          ];
        }
        return prev;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const addAlert = (alert: Omit<GlobalAlert, "id" | "timestamp">) => {
    const newAlert: GlobalAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      timestamp: new Date(),
    };
    setAlerts((prev) => [...prev, newAlert]);
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert, dismissAlert, clearAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};
