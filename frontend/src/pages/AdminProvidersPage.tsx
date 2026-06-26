import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";
import { apiRequest } from "@/lib/api";
import { Search, Filter, Star, MapPin, Phone, Mail, CheckCircle, AlertCircle } from "lucide-react";

const AdminProvidersPage = () => {
  const [providers, setProviders] = useState<User[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "approved" | "pending">("all");
  const { toast } = useToast();

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await apiRequest<{ users: User[] }>("/users");
        const providersList = response.users.filter((u) => u.role === "provider");
        setProviders(providersList);
      } catch {
        setProviders([]);
      }
    };

    loadProviders();
  }, []);

  useEffect(() => {
    let filtered = providers;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
      );
    }

    if (approvalFilter === "approved") {
      filtered = filtered.filter((p) => p.approved === true);
    } else if (approvalFilter === "pending") {
      filtered = filtered.filter((p) => p.approved === false);
    }

    setFilteredProviders(filtered);
  }, [providers, searchQuery, approvalFilter]);

  const approveProvider = async (id: string) => {
    try {
      const response = await apiRequest<{ user: User }>(`/users/${id}/approve`, { method: "PATCH" });
      setProviders((prev) => prev.map((p) => (p.id === id ? response.user : p)));
      toast({ title: "Provider approved successfully!" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to approve provider";
      toast({ title: "Action failed", description: message, variant: "destructive" });
    }
  };

  const rejectProvider = async (id: string) => {
    try {
      await apiRequest<unknown>(`/users/${id}`, { method: "DELETE" });
      setProviders((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Provider rejected and removed." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reject provider";
      toast({ title: "Action failed", description: message, variant: "destructive" });
    }
  };

  const suspendProvider = async (id: string) => {
    try {
      await apiRequest<{ user: User }>(`/users/${id}/suspend`, { method: "PATCH" });
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, approved: false } : p
        )
      );
      toast({ title: "Provider suspended successfully!" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to suspend provider";
      toast({ title: "Action failed", description: message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Providers</h1>
          <p className="mt-1 text-muted-foreground">Manage and monitor service providers</p>
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

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
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
            Showing {filteredProviders.length} of {providers.length} providers
          </div>
        </div>

        {/* Providers Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12 rounded-lg border border-dashed bg-card">
              <p className="text-muted-foreground">No providers found matching your criteria</p>
            </div>
          ) : (
            filteredProviders.map((provider) => (
              <div key={provider.id} className="rounded-lg border bg-card hover:shadow-md transition-shadow overflow-hidden">
                {/* Header with approval status */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                        {provider.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">Provider ID: {provider.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <Badge
                      className={`flex items-center gap-1 flex-shrink-0 ${
                        provider.approved
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }`}
                      variant="outline"
                    >
                      {provider.approved ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          Pending
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${provider.email}`} className="truncate hover:text-foreground transition-colors">
                        {provider.email}
                      </a>
                    </div>
                    {provider.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${provider.phone}`} className="hover:text-foreground transition-colors">
                          {provider.phone}
                        </a>
                      </div>
                    )}
                    {provider.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Rating (placeholder) */}
                  <div className="flex items-center gap-1 py-2 border-t border-b">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-xs text-muted-foreground">(24 reviews)</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {!provider.approved && (
                      <Button
                        size="sm"
                        onClick={() => approveProvider(provider.id)}
                        className="flex-1"
                      >
                        Approve
                      </Button>
                    )}
                    {provider.approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => suspendProvider(provider.id)}
                        className="flex-1"
                      >
                        Suspend
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive flex-1"
                      onClick={() => rejectProvider(provider.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminProvidersPage;
