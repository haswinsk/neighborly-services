import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { mockServices } from "@/data/mockData";
import { SERVICE_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProviderServicesPage = () => {
  const myServices = mockServices.filter((s) => s.providerId === "p1");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Service saved!" });
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Services</h1>
          <p className="mt-1 text-muted-foreground">Manage your service offerings</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="mt-6 rounded-lg border bg-card p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Service Name</Label>
              <Input className="mt-1" placeholder="e.g. Emergency Plumbing" />
            </div>
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea className="mt-1" placeholder="Describe your service..." />
          </div>
          <div>
            <Label>Price (₹)</Label>
            <Input type="number" className="mt-1 w-40" placeholder="0" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Service</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {myServices.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border bg-card p-5">
            <div>
              <span className="text-xs font-medium text-primary">{s.category}</span>
              <p className="font-semibold text-foreground">{s.serviceName}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">{s.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-foreground">₹{s.price}</span>
              <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ProviderServicesPage;
