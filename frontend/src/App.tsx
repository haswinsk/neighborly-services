import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerBookingsPage from "./pages/CustomerBookingsPage";
import ServiceListingPage from "./pages/ServiceListingPage";
import ServiceDetailsPage from "./pages/ServiceDetailsPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderServicesPage from "./pages/ProviderServicesPage";
import ProviderBookingsPage from "./pages/ProviderBookingsPage";
import ProviderEarningsPage from "./pages/ProviderEarningsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RoleRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: Array<"customer" | "provider" | "admin">;
}) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (user.role === "provider" && user.approved === false && location.pathname !== "/provider") {
    return <Navigate to="/provider" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NotificationProvider>
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/services" element={<ServiceListingPage />} />
            <Route path="/services/:id" element={<ServiceDetailsPage />} />
            <Route
              path="/customer"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["customer"]}>
                    <CustomerDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/bookings"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["customer"]}>
                    <CustomerBookingsPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["provider"]}>
                    <ProviderDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/services"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["provider"]}>
                    <ProviderServicesPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/bookings"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["provider"]}>
                    <ProviderBookingsPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/earnings"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["provider"]}>
                    <ProviderEarningsPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["admin"]}>
                    <AdminUsersPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["admin"]}>
                    <AdminBookingsPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["admin"]}>
                    <AdminCategoriesPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/500" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </NotificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
