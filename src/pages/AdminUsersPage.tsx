import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { mockUsers } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const { toast } = useToast();

  const approveProvider = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, approved: true } : u)));
    toast({ title: "Provider approved!" });
  };

  const rejectProvider = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast({ title: "Provider rejected and removed." });
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
      <p className="mt-1 text-muted-foreground">View and manage all platform users</p>

      <div className="mt-6 space-y-3">
        {users.map((u) => (
          <div key={u.id} className="flex flex-col gap-3 rounded-lg border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {u.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-foreground">{u.name}</p>
                <p className="text-sm text-muted-foreground">{u.email} · {u.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="capitalize">{u.role}</Badge>
              {u.role === "provider" && u.approved === false && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveProvider(u.id)}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => rejectProvider(u.id)}>Reject</Button>
                </div>
              )}
              {u.role === "provider" && u.approved === true && (
                <Badge className="bg-success/10 text-success border-success/20" variant="outline">Approved</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
