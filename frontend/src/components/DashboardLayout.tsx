import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LucideIcon, Home, Search, Calendar, User, LayoutDashboard, Wrench, ClipboardList, DollarSign, Users, BookOpen, FolderOpen, LogOut } from "lucide-react";
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
  { label: "All Bookings", path: "/admin/bookings", icon: BookOpen },
  { label: "Categories", path: "/admin/categories", icon: FolderOpen },
];

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = user?.role === "admin" ? adminNav : user?.role === "provider" ? providerNav : customerNav;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-border bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80">
                <Wrench className="h-5 w-5 text-white" />
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
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-4">
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-semibold text-white">
                {user?.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg" 
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-white/95 backdrop-blur-sm px-4 py-3 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">LocalServ</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="flex items-center justify-around border-t border-border bg-white/95 backdrop-blur-sm py-2 lg:hidden">
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors ${
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
