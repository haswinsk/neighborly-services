import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SERVICE_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<string[]>([...SERVICE_CATEGORIES]);
  const [newCat, setNewCat] = useState("");
  const { toast } = useToast();

  const addCategory = () => {
    if (!newCat.trim()) return;
    if (categories.includes(newCat.trim())) {
      toast({ title: "Category already exists", variant: "destructive" });
      return;
    }
    setCategories([...categories, newCat.trim()]);
    setNewCat("");
    toast({ title: "Category added!" });
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
    toast({ title: "Category removed" });
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground">Service Categories</h1>
      <p className="mt-1 text-muted-foreground">Manage service categories</p>

      <div className="mt-6 flex gap-2">
        <Input placeholder="New category name" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="max-w-xs" />
        <Button onClick={addCategory} className="gap-2"><Plus className="h-4 w-4" /> Add</Button>
      </div>

      <div className="mt-6 space-y-2">
        {categories.map((cat) => (
          <div key={cat} className="flex items-center justify-between rounded-lg border bg-card px-5 py-3">
            <span className="font-medium text-foreground">{cat}</span>
            <Button variant="ghost" size="icon" onClick={() => removeCategory(cat)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminCategoriesPage;
