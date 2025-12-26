import { AlertTriangle, CloudRain, CheckCircle, X } from "lucide-react";
import { useState } from "react";

interface Alert {
  id: string;
  type: "rain" | "dry" | "warning";
  message: string;
  time: string;
}

interface SmartAlertProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

const SmartAlert = ({ alerts, onDismiss }: SmartAlertProps) => {
  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "rain":
        return {
          bg: "bg-accent/10 border-accent/30",
          icon: <CloudRain className="w-5 h-5 text-accent" />,
          text: "text-accent",
        };
      case "dry":
        return {
          bg: "bg-success/10 border-success/30",
          icon: <CheckCircle className="w-5 h-5 text-success" />,
          text: "text-success",
        };
      case "warning":
        return {
          bg: "bg-destructive/10 border-destructive/30",
          icon: <AlertTriangle className="w-5 h-5 text-destructive" />,
          text: "text-destructive",
        };
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        return (
          <div
            key={alert.id}
            className={`flex items-center gap-3 p-4 rounded-xl border ${styles.bg} animate-slide-up`}
          >
            {styles.icon}
            <div className="flex-1">
              <p className={`font-medium ${styles.text}`}>{alert.message}</p>
              <p className="text-xs text-muted-foreground">{alert.time}</p>
            </div>
            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SmartAlert;
export type { Alert };
