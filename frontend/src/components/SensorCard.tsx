import { Thermometer, Droplets, CloudRain, Sun, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface SensorCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  status?: "normal" | "warning" | "success";
}

const SensorCard = ({ icon, label, value, unit, status = "normal" }: SensorCardProps) => {
  const statusColors = {
    normal: "text-primary",
    warning: "text-accent",
    success: "text-success",
  };

  return (
    <Card variant="sensor" className="p-4">
      <CardContent className="p-0 flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-primary/10 ${statusColors[status]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold text-foreground">
            {value}
            {unit && <span className="text-base font-normal text-muted-foreground ml-1">{unit}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Pre-configured sensor cards
export const TemperatureCard = ({ value }: { value: number }) => (
  <SensorCard
    icon={<Thermometer className="w-6 h-6" />}
    label="Temperature"
    value={value}
    unit="°C"
    status={value > 35 ? "warning" : "normal"}
  />
);

export const HumidityCard = ({ value }: { value: number }) => (
  <SensorCard
    icon={<Droplets className="w-6 h-6" />}
    label="Humidity"
    value={value}
    unit="%"
    status={value > 70 ? "warning" : "normal"}
  />
);

export const RainCard = ({ isRaining }: { isRaining: boolean }) => (
  <SensorCard
    icon={isRaining ? <CloudRain className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
    label="Rain Status"
    value={isRaining ? "Detected" : "Clear"}
    status={isRaining ? "warning" : "success"}
  />
);

export const DryStatusCard = ({ isDry }: { isDry: boolean }) => (
  <SensorCard
    icon={isDry ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
    label="Laundry Status"
    value={isDry ? "Dry" : "Drying"}
    status={isDry ? "success" : "normal"}
  />
);

export default SensorCard;
