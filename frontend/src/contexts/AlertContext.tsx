import { createContext, useContext, useState, ReactNode } from "react";

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
