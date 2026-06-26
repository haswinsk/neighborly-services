import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LucideIcon, Home, Search, Calendar, User, LayoutDashboard, Wrench, ClipboardList, DollarSign, Users, BookOpen, FolderOpen, LogOut, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const customerNav: NavItem[] = [
  { label: "Dashboard", path: "/customer", icon: LayoutDashboard },
  { label: "Browse Services", path: "/services", icon: Search },
  { label: "My Bookings", path: "/customer/bookings", icon: Calendar },
  { label: "Profile", path: "/profile", icon: User },
];

const providerNav: NavItem[] = [
  { label: "Dashboard", path: "/provider", icon: LayoutDashboard },
  { label: "My Services", path: "/provider/services", icon: Wrench },
  { label: "Booking Requests", path: "/provider/bookings", icon: ClipboardList },
  { label: "Earnings", path: "/provider/earnings", icon: DollarSign },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Manage Users", path: "/admin/users", icon: Users },
  { label: "Providers", path: "/admin/providers", icon: Wrench },
  { label: "All Bookings", path: "/admin/bookings", icon: BookOpen },
  { label: "Reports", path: "/admin/reports", icon: BarChart3 },
  { label: "Categories", path: "/admin/categories", icon: FolderOpen },
];

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = user?.role === "admin" ? adminNav : user?.role === "provider" ? providerNav : customerNav;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-card lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b p-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Wrench className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">LocalServ</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <div className="mb-3 flex items-center gap-3 px-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {user?.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">LocalServ</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="flex items-center justify-around border-t bg-card py-2 lg:hidden">
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
