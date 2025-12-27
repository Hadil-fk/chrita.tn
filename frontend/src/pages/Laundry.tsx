import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Shirt, CheckCircle, Clock, Sun, Droplets, CloudRain } from "lucide-react";

interface LaundryItem {
  id: string;
  type: string;
  quantity: number;
  status: "pending" | "drying" | "dry";
  addedAt: Date;
  // When drying actually started (after rain stops, etc.). Null when paused/pending
  startedDryingAt: Date | null;
  // Accumulated drying time in hours from previous active drying periods
  accumulatedHours: number;
}

interface LaundryItemSerialized {
  id: string;
  type: string;
  quantity: number;
  status: "pending" | "drying" | "dry";
  addedAt: string;
  startedDryingAt: string | null;
  accumulatedHours: number;
}
interface EnvironmentalConditions { 
  temperature: number; // Celsius
   humidity: number; // 0-100% 
  rain: boolean; 
  sunExposure: number; // 0-100% (sun intensity) lastUpdated: string;
  lastUpdated: string;}

const STORAGE_KEY = "laundry_items";
const ENV_STORAGE_KEY = "laundry_environment";

// Realistic base drying times in hours for different laundry types (under ideal conditions: 25°C, 40% humidity, full sun)
const DRYING_TIMES: Record<string, number> = {
  shirts: 2.5,      // Light fabric, dries quickly
  pants: 4.0,       // Heavier fabric, takes longer
  towels: 5.0,     // Thick and absorbent
  bedding: 6.0,    // Very thick, takes longest
  socks: 1.5,       // Small items, dry quickly
  underwear: 1.0,  // Smallest items, dry fastest
  jackets: 5.5,    // Thick outerwear
  dresses: 3.0,    // Medium weight
  other: 3.5,      // Default for unknown types
};

const laundryTypes = [
  { value: "shirts", label: "Shirts", icon: "👕" },
  { value: "pants", label: "Pants", icon: "👖" },
  { value: "towels", label: "Towels", icon: "🧺" },
  { value: "bedding", label: "Bedding", icon: "🛏️" },
  { value: "socks", label: "Socks", icon: "🧦" },
  { value: "underwear", label: "Underwear", icon: "👙" },
  { value: "jackets", label: "Jackets", icon: "🧥" },
  { value: "dresses", label: "Dresses", icon: "👗" },
  { value: "other", label: "Other", icon: "📦" },
];

// Helper functions for localStorage persistence
const loadItemsFromStorage = (): LaundryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const serialized: LaundryItemSerialized[] = JSON.parse(stored);
    return serialized.map(item => ({
      ...item,
      addedAt: new Date(item.addedAt),
      startedDryingAt: item.startedDryingAt ? new Date(item.startedDryingAt) : null,
      accumulatedHours: typeof item.accumulatedHours === 'number' ? item.accumulatedHours : 0,
    }));
  } catch (error) {
    console.error("Error loading laundry items from localStorage:", error);
    return [];
  }
};

const saveItemsToStorage = (items: LaundryItem[]): void => {
  try {
    const serialized: LaundryItemSerialized[] = items.map(item => ({
      ...item,
      addedAt: item.addedAt.toISOString(),
      startedDryingAt: item.startedDryingAt ? item.startedDryingAt.toISOString() : null,
      accumulatedHours: item.accumulatedHours || 0,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error("Error saving laundry items to localStorage:", error);
  }
};

// Environmental conditions management
const loadEnvironmentalConditions = (): EnvironmentalConditions => {
  try {
    const stored = localStorage.getItem(ENV_STORAGE_KEY);
    if (stored) {
      const env: EnvironmentalConditions = JSON.parse(stored);
      return {
        ...env,
        lastUpdated: env.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("Error loading environmental conditions:", error);
  }
  
  // Default conditions (simulated - in production, these would come from sensors)
  return {
    temperature: 22,
    humidity: 45,
    rain: false,
    sunExposure: 75, // 75% sun exposure
    lastUpdated: new Date().toISOString(),
  };
};

const saveEnvironmentalConditions = (env: EnvironmentalConditions): void => {
  try {
    localStorage.setItem(ENV_STORAGE_KEY, JSON.stringify(env));
  } catch (error) {
    console.error("Error saving environmental conditions:", error);
  }
};

// Calculate effective drying time based on environmental conditions
const calculateEffectiveDryingTime = (
  baseTime: number,
  conditions: EnvironmentalConditions
): number => {
  let effectiveTime = baseTime;
  
  // Temperature effect: Higher temp = faster drying (20-30°C optimal)
  if (conditions.temperature < 10) {
    effectiveTime *= 2.5; // Very cold, dries very slowly
  } else if (conditions.temperature < 15) {
    effectiveTime *= 2.0; // Cold, dries slowly
  } else if (conditions.temperature < 20) {
    effectiveTime *= 1.5; // Cool, dries moderately
  } else if (conditions.temperature > 35) {
    effectiveTime *= 0.7; // Very hot, dries faster
  } else if (conditions.temperature > 30) {
    effectiveTime *= 0.85; // Hot, dries faster
  }
  // 20-30°C is optimal, no multiplier
  
  // Humidity effect: Lower humidity = faster drying
  if (conditions.humidity > 80) {
    effectiveTime *= 2.0; // Very humid, dries very slowly
  } else if (conditions.humidity > 60) {
    effectiveTime *= 1.5; // Humid, dries slowly
  } else if (conditions.humidity < 30) {
    effectiveTime *= 0.7; // Dry air, dries faster
  } else if (conditions.humidity < 40) {
    effectiveTime *= 0.85; // Low humidity, dries faster
  }
  // 40-60% is optimal, no multiplier
  
  // Sun exposure effect: More sun = faster drying
  const sunMultiplier = 1.0 - (conditions.sunExposure / 100) * 0.3; // Up to 30% faster with full sun
  effectiveTime *= sunMultiplier;
  
  // Rain effect: If raining, drying stops (handled separately)
  if (conditions.rain) {
    effectiveTime = Infinity; // Won't dry while raining
  }
  
  return Math.max(0.5, effectiveTime); // Minimum 0.5 hours
};

// Calculate drying progress (0-100%)
const calculateDryingProgress = (
  item: LaundryItem,
  conditions: EnvironmentalConditions
): number => {
  if (item.status === "dry") return 100;

  const baseTime = DRYING_TIMES[item.type] || DRYING_TIMES.other;
  const effectiveTime = calculateEffectiveDryingTime(baseTime, conditions);

  // accumulatedHours stores prior drying time when item was actively drying
  let elapsedHours = item.accumulatedHours || 0;

  // If currently drying, add the active period
  if (item.status === "drying" && item.startedDryingAt) {
    elapsedHours += (Date.now() - item.startedDryingAt.getTime()) / (1000 * 60 * 60);
  }

  const progress = Math.min(100, Math.max(0, (elapsedHours / effectiveTime) * 100));
  return Math.round(progress);
};

// Determine if item should be dry based on conditions and time
const shouldBeDry = (
  item: LaundryItem,
  conditions: EnvironmentalConditions
): boolean => {
  if (item.status === "dry") return true;
  if (conditions.rain) return false; // Can't dry while raining

  const baseTime = DRYING_TIMES[item.type] || DRYING_TIMES.other;
  const effectiveTime = calculateEffectiveDryingTime(baseTime, conditions);

  let elapsedHours = item.accumulatedHours || 0;
  if (item.startedDryingAt) {
    elapsedHours += (Date.now() - item.startedDryingAt.getTime()) / (1000 * 60 * 60);
  }

  return elapsedHours >= effectiveTime;
};

const Laundry = () => {
  const [items, setItems] = useState<LaundryItem[]>([]);
  const [newItem, setNewItem] = useState({ type: "", quantity: 1 });
  const [isAdding, setIsAdding] = useState(false);
  const [environment, setEnvironment] = useState<EnvironmentalConditions>(loadEnvironmentalConditions());
  const isInitialMount = useRef(true);

  // Load items from localStorage on mount
  useEffect(() => {
    const loadedItems = loadItemsFromStorage();
    setItems(loadedItems);
    isInitialMount.current = false;
  }, []);

  // Save items to localStorage whenever items change (after initial load)
  useEffect(() => {
    if (!isInitialMount.current) {
      saveItemsToStorage(items);
    }
  }, [items]);

  // Listen for environmental updates published by the Dashboard.
  // Dashboard publishes an object to localStorage key ENV_STORAGE_KEY and
  // dispatches a custom window event 'environmental:update' with the same payload.
  useEffect(() => {
    // Ensure environment is initialized from storage (if Dashboard already saved it)
    const stored = loadEnvironmentalConditions();
    setEnvironment(stored);

    const handleCustomEvent = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as EnvironmentalConditions | undefined;
        if (detail) {
          setEnvironment(detail);
          saveEnvironmentalConditions(detail);
        }
      } catch (err) {
        console.error("Error handling environmental custom event:", err);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === ENV_STORAGE_KEY && e.newValue) {
        try {
          const env = JSON.parse(e.newValue) as EnvironmentalConditions;
          setEnvironment(env);
        } catch (err) {
          console.error("Error parsing environmental conditions from storage event:", err);
        }
      }
    };

    window.addEventListener("environmental:update", handleCustomEvent as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("environmental:update", handleCustomEvent as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Automatically update item statuses based on time and conditions
  useEffect(() => {
    const updateStatuses = () => {
      setItems(currentItems => {
          const updated = currentItems.map(item => {
            // If item is already dry, keep it dry
            if (item.status === "dry") return item;

            // If it's currently drying and it starts raining, accumulate elapsed time and pause
            if (environment.rain && item.status === "drying") {
              const now = Date.now();
              const accrued = item.startedDryingAt ? (now - item.startedDryingAt.getTime()) / (1000 * 60 * 60) : 0;
              return {
                ...item,
                status: "pending" as const,
                accumulatedHours: (item.accumulatedHours || 0) + accrued,
                startedDryingAt: null,
              };
            }

            // If it was pending and rain stopped, resume drying from accumulated time
            if (!environment.rain && item.status === "pending") {
              return {
                ...item,
                status: "drying" as const,
                startedDryingAt: new Date(),
              };
            }

            // Check if item should be dry now
            if (item.status === "drying" && shouldBeDry(item, environment)) {
              return {
                ...item,
                status: "dry" as const,
              };
            }

            return item;
          });

          return updated;
        });
    };

    // Update every 30 seconds
    const interval = setInterval(updateStatuses, 30000);
    updateStatuses(); // Run immediately
    
    return () => clearInterval(interval);
  }, [environment]);

  const handleAddItem = () => {
    if (!newItem.type) {
      toast({
        title: "Select Type",
        description: "Please select a laundry type.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const item: LaundryItem = {
      id: Date.now().toString(),
      type: newItem.type,
      quantity: newItem.quantity,
      status: environment.rain ? "pending" : "drying",
      addedAt: now,
      startedDryingAt: environment.rain ? null : now, // null while pending/paused
      accumulatedHours: 0,
    };

    setItems([...items, item]);
    setNewItem({ type: "", quantity: 1 });
    setIsAdding(false);
    
    toast({
      title: "Laundry Added",
      description: `Added ${newItem.quantity} ${laundryTypes.find(t => t.value === newItem.type)?.label} to your laundry.`,
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Laundry item has been removed.",
    });
  };

  const getStatusBadge = (item: LaundryItem) => {
    const progress = calculateDryingProgress(item, environment);
    
    if (item.status === "dry") {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
          <CheckCircle className="w-3 h-3" />
          Dry
        </span>
      );
    }
  
    if (item.status === "pending") {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
          <CloudRain className="w-3 h-3" />
          Pending
        </span>
      );
    }
  
    if (environment.rain) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
          <CloudRain className="w-3 h-3" />
          Paused
        </span>
      );
    }
    
    return (
      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
        <Clock className="w-3 h-3" />
        {progress}% Dry
      </span>
    );
  };

  const getTypeInfo = (type: string) => {
    return laundryTypes.find(t => t.value === type) || { label: type, icon: "📦" };
  };

  const formatTimeRemaining = (item: LaundryItem): string => {
    if (item.status === "dry") return "Ready!";
    if (environment.rain) return "Waiting for rain to stop...";
    
    const baseTime = DRYING_TIMES[item.type] || DRYING_TIMES.other;
    const effectiveTime = calculateEffectiveDryingTime(baseTime, environment);
    let elapsedHours = item.accumulatedHours || 0;
    if (item.startedDryingAt) {
      elapsedHours += (Date.now() - item.startedDryingAt.getTime()) / (1000 * 60 * 60);
    }
    const remainingHours = Math.max(0, effectiveTime - elapsedHours);
    
    if (remainingHours < 0.1) return "Almost ready!";
    if (remainingHours < 1) return `${Math.round(remainingHours * 60)} min left`;
    return `${Math.round(remainingHours * 10) / 10}h left`;
  };

  const stats = {
    total: items.reduce((sum, item) => sum + item.quantity, 0),
    drying: items.filter(i => i.status === "drying").reduce((sum, item) => sum + item.quantity, 0),
    dry: items.filter(i => i.status === "dry").reduce((sum, item) => sum + item.quantity, 0),
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Laundry</h1>
            <p className="text-muted-foreground mt-1">
              Track your laundry with automatic status updates
            </p>
          </div>
          <Button 
            variant="gradient" 
            onClick={() => setIsAdding(true)} 
            className="gap-2 pointer-events-auto cursor-pointer whitespace-nowrap"
            type="button"
          >
            <Plus className="w-4 h-4" />
            Add Laundry
          </Button>
        </div>

        {/* Environmental Conditions Display */}
        <Card variant="glass" className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Temp:</span>
                <span className="font-medium">{Math.round(environment.temperature)}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Humidity:</span>
                <span className="font-medium">{Math.round(environment.humidity)}%</span>
              </div>
              <div className="flex items-center gap-2">
                {environment.rain ? (
                  <>
                    <CloudRain className="w-4 h-4 text-destructive" />
                    <span className="text-destructive font-medium">Raining</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-success" />
                    <span className="text-success font-medium">Clear</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Sun:</span>
                <span className="font-medium">{Math.round(environment.sunExposure)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{stats.drying}</p>
              <p className="text-sm text-muted-foreground">Drying</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-success">{stats.dry}</p>
              <p className="text-sm text-muted-foreground">Ready</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Item Form */}
        {isAdding && (
          <Card variant="glass" className="mb-8 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg">Add New Laundry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={newItem.type}
                  onValueChange={(value) => setNewItem({ ...newItem, type: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {laundryTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full sm:w-24"
                  placeholder="Qty"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="gradient" 
                    onClick={handleAddItem}
                    className="pointer-events-auto cursor-pointer"
                    type="button"
                  >
                    Add
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAdding(false)}
                    className="pointer-events-auto cursor-pointer"
                    type="button"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Laundry List */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <Card variant="glass" className="p-12 text-center">
              <Shirt className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No laundry items yet</p>
              <p className="text-muted-foreground mb-4">
                Add your first laundry item to start tracking
              </p>
              <Button 
                variant="gradient" 
                onClick={() => setIsAdding(true)}
                className="pointer-events-auto cursor-pointer"
                type="button"
              >
                <Plus className="w-4 h-4" />
                Add Laundry
              </Button>
            </Card>
          ) : (
            items.map((item) => {
              const typeInfo = getTypeInfo(item.type);
              const progress = calculateDryingProgress(item, environment);
              const baseTime = DRYING_TIMES[item.type] || DRYING_TIMES.other;
              
              return (
                <Card key={item.id} variant="sensor" className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{typeInfo.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">{typeInfo.label}</p>
                          {getStatusBadge(item)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.quantity} item{item.quantity > 1 ? "s" : ""} • Added {item.addedAt.toLocaleTimeString()}
                        </p>
                        {item.status === "pending" && (
                          <p className="text-xs text-destructive mt-1">
                            ⚠️ Waiting for rain to stop before drying
                          </p>
                        )}
                        {item.status === "drying" && !environment.rain && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Drying Progress</span>
                              <span>{formatTimeRemaining(item)}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {item.status === "drying" && environment.rain && (
                          <p className="text-xs text-destructive mt-1">
                            ⚠️ Drying paused - rain detected
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-destructive hover:bg-destructive/10 pointer-events-auto cursor-pointer"
                        type="button"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Laundry;
