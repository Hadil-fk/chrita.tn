import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Shirt, Edit2, CheckCircle, Clock } from "lucide-react";

interface LaundryItem {
  id: string;
  type: string;
  quantity: number;
  status: "drying" | "dry" | "pending";
  addedAt: Date;
}

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

const Laundry = () => {
  const [items, setItems] = useState<LaundryItem[]>([
    { id: "1", type: "shirts", quantity: 5, status: "drying", addedAt: new Date() },
    { id: "2", type: "towels", quantity: 3, status: "dry", addedAt: new Date(Date.now() - 3600000) },
  ]);
  const [newItem, setNewItem] = useState({ type: "", quantity: 1 });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = () => {
    if (!newItem.type) {
      toast({
        title: "Select Type",
        description: "Please select a laundry type.",
        variant: "destructive",
      });
      return;
    }

    const item: LaundryItem = {
      id: Date.now().toString(),
      type: newItem.type,
      quantity: newItem.quantity,
      status: "pending",
      addedAt: new Date(),
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

  const handleStatusChange = (id: string, status: LaundryItem["status"]) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, status } : item
    ));
  };

  const getStatusBadge = (status: LaundryItem["status"]) => {
    switch (status) {
      case "dry":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
            <CheckCircle className="w-3 h-3" />
            Dry
          </span>
        );
      case "drying":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Clock className="w-3 h-3" />
            Drying
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  const getTypeInfo = (type: string) => {
    return laundryTypes.find(t => t.value === type) || { label: type, icon: "📦" };
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
              Classify and track your laundry items
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
              return (
                <Card key={item.id} variant="sensor" className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{typeInfo.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{typeInfo.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} item{item.quantity > 1 ? "s" : ""} • Added {item.addedAt.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(item.status)}
                        <Select
                          value={item.status}
                          onValueChange={(value) => handleStatusChange(item.id, value as LaundryItem["status"])}
                        >
                          <SelectTrigger className="w-auto border-0 bg-transparent p-2">
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="drying">Drying</SelectItem>
                            <SelectItem value="dry">Dry</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-destructive hover:bg-destructive/10 pointer-events-auto cursor-pointer"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
