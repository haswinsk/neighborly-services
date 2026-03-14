import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import HomePage from "./pages/HomePage";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/services" element={<ServiceListingPage />} />
            <Route path="/services/:id" element={<ServiceDetailsPage />} />
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/bookings" element={<CustomerBookingsPage />} />
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/provider/services" element={<ProviderServicesPage />} />
            <Route path="/provider/bookings" element={<ProviderBookingsPage />} />
            <Route path="/provider/earnings" element={<ProviderEarningsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
