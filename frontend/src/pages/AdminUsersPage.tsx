import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";
import { apiRequest } from "@/lib/api";
import { Search, Filter } from "lucide-react";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "customer" | "provider">("all");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "approved" | "pending">("all");
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await apiRequest<{ users: User[] }>("/users");
        setUsers(response.users);
      } catch {
        setUsers([]);
      }
    };

    loadUsers();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.location.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Approval filter
    if (approvalFilter === "approved") {
      filtered = filtered.filter((u) => u.approved === true);
    } else if (approvalFilter === "pending") {
      filtered = filtered.filter((u) => u.approved === false);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter, approvalFilter]);

  const approveProvider = async (id: string) => {
    try {
      const response = await apiRequest<{ user: User }>(`/users/${id}/approve`, { method: "PATCH" });
      setUsers((prev) => prev.map((u) => (u.id === id ? response.user : u)));
      toast({ title: "Provider approved!" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to approve provider";
      toast({ title: "Action failed", description: message, variant: "destructive" });
    }
  };

  const rejectProvider = async (id: string) => {
    try {
      await apiRequest<unknown>(`/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast({ title: "Provider rejected and removed." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reject provider";
      toast({ title: "Action failed", description: message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
          <p className="mt-1 text-muted-foreground">View and manage all platform users</p>
        </div>

        {/* Search and Filters */}
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent focus:outline-none text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Role:</span>
            </div>
            {(["all", "customer", "provider"] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  roleFilter === role
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-foreground hover:bg-accent/80"
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}

            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-muted-foreground">Status:</span>
            </div>
            {(["all", "approved", "pending"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setApprovalFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  approvalFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-foreground hover:bg-accent/80"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12 rounded-lg border border-dashed bg-card">
              <p className="text-muted-foreground">No users found matching your criteria</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
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
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
