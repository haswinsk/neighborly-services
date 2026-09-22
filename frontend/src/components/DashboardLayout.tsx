import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LucideIcon, Search, Calendar, User, LayoutDashboard, Wrench, ClipboardList, DollarSign, Users, BookOpen, FolderOpen, LogOut, BarChart3, AlertTriangle, Bell, MessageSquare, Power, Brain, ShieldCheck, TrendingUp, Settings, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/customer/CustomerUI";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const customerNav: NavItem[] = [
  { label: "Dashboard", path: "/customer", icon: LayoutDashboard },
  { label: "Browse Services", path: "/services", icon: Search },
  { label: "AI Match", path: "/recommendations", icon: Brain },
  { label: "On-Road", path: "/on-road-services", icon: AlertTriangle },
  { label: "My Bookings", path: "/customer/bookings", icon: Calendar },
  { label: "Messages", path: "/customer/messages", icon: MessageSquare },
  { label: "Notifications", path: "/customer/notifications", icon: Bell },
  { label: "Profile", path: "/customer/profile", icon: User },
];

const providerNav: NavItem[] = [
  { label: "Dashboard", path: "/provider", icon: LayoutDashboard },
  { label: "Requests", path: "/provider/requests", icon: ClipboardList },
  { label: "Active Job", path: "/provider/active", icon: Power },
  { label: "Bookings", path: "/provider/bookings", icon: Calendar },
  { label: "My Services", path: "/provider/services", icon: Wrench },
  { label: "Earnings", path: "/provider/earnings", icon: DollarSign },
  { label: "Verification", path: "/provider/verification", icon: ShieldCheck },
  { label: "Performance", path: "/provider/performance", icon: TrendingUp },
  { label: "AI Insights", path: "/provider/ai-insights", icon: Brain },
  { label: "Messages", path: "/provider/messages", icon: MessageSquare },
  { label: "Notifications", path: "/provider/notifications", icon: Bell },
  { label: "Profile", path: "/provider/profile", icon: User },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Manage Users", path: "/admin/users", icon: Users },
  { label: "Providers", path: "/admin/providers", icon: Wrench },
  { label: "Verification Queue", path: "/admin/providers/verification", icon: ShieldCheck },
  { label: "All Bookings", path: "/admin/bookings", icon: BookOpen },
  { label: "Reports", path: "/admin/reports", icon: BarChart3 },
  { label: "Categories", path: "/admin/categories", icon: FolderOpen },
  { label: "AI Intelligence", path: "/admin/ai", icon: Brain },
  { label: "Demand Forecast", path: "/admin/demand", icon: TrendingUp },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Revenue Model", path: "/admin/revenue", icon: DollarSign },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const navItems = user?.role === "admin" ? adminNav : user?.role === "provider" ? providerNav : customerNav;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - FIXED */}
      <aside className="hidden fixed left-0 top-0 h-screen w-64 border-r bg-card lg:flex flex-col">
        <div className="flex-shrink-0 border-b p-6">
          <Link to="/" className="flex items-center gap-2">
            <BrandMark />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
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
        <div className="flex-shrink-0 border-t p-4">
          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {user?.role === "provider" ? (user?.isAvailable ? "Provider · Available" : "Provider · Offline") : user?.role}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground mb-2">
                {theme === "light" && <Sun className="h-4 w-4" />}
                {theme === "dark" && <Moon className="h-4 w-4" />}
                {theme === "system" && <Monitor className="h-4 w-4" />}
                <span className="capitalize">{theme === "system" ? "System" : theme}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="h-4 w-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content with margin-left for fixed sidebar */}
      <div className="flex flex-1 flex-col lg:ml-64">
        <header className="flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <BrandMark compact />
            <span className="text-base font-bold text-foreground">Neighbourly</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="flex items-center justify-around border-t bg-card py-2 lg:hidden">
          {(user?.role === "customer"
            ? customerNav.filter((item) => ["Dashboard", "Browse Services", "On-Road", "My Bookings", "Profile"].includes(item.label))
            : user?.role === "provider"
            ? providerNav.filter((item) => ["Dashboard", "Requests", "My Services", "AI Insights", "Profile"].includes(item.label))
            : navItems.slice(0, 4)
          ).map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
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
