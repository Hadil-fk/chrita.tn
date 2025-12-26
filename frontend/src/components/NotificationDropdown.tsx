import { CloudRain, CheckCircle, AlertTriangle, Info, X, Bell } from "lucide-react";
import { useAlerts, GlobalAlert } from "@/contexts/AlertContext";
import { useState } from "react";

const NotificationDropdown = () => {
  const { alerts, dismissAlert } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);

  const getAlertConfig = (type: GlobalAlert["type"]) => {
    switch (type) {
      case "rain":
        return {
          icon: <CloudRain className="w-4 h-4" />,
          bg: "bg-accent/20",
          text: "text-accent",
          glow: "shadow-[0_0_10px_hsla(38,91%,55%,0.3)]",
        };
      case "dry":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          bg: "bg-success/20",
          text: "text-success",
          glow: "shadow-[0_0_10px_hsla(142,72%,45%,0.3)]",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          bg: "bg-destructive/20",
          text: "text-destructive",
          glow: "shadow-[0_0_10px_hsla(0,84%,60%,0.3)]",
        };
      case "info":
        return {
          icon: <Info className="w-4 h-4" />,
          bg: "bg-primary/20",
          text: "text-primary",
          glow: "shadow-[0_0_10px_hsla(199,72%,59%,0.3)]",
        };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (alerts.length === 0) {
    return (
      <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
        <Bell className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {alerts.length > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg overflow-hidden shadow-lg z-50 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Notifications ({alerts.length})
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alerts list */}
          <div className="max-h-80 overflow-y-auto">
            {alerts.map((alert) => {
              const config = getAlertConfig(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-2 px-3 py-2 border-b border-border/20 last:border-b-0
                    hover:bg-muted/30 transition-colors animate-fade-in`}
                >
                  <div className={`p-0.5 rounded-lg flex-shrink-0 mt-0.5 ${config.bg}`}>
                    <span className={`${config.text} text-xs`}>{config.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${config.text}`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTime(alert.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissAlert(alert.id);
                    }}
                    className="p-0.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationDropdown;
