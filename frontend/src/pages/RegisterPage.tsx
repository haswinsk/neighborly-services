import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Wrench, Eye, EyeOff, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("customer");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  }>({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await register(name, email, password, role, phone, location);
      if (!newUser) {
        toast({ title: "Error", description: "Unable to create account", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Account created successfully!",
        description: role === "provider" ? "Your account is pending admin approval." : "Welcome to LocalServ!",
        variant: "default"
      });

      if (newUser.role === "admin") navigate("/admin");
      else if (newUser.role === "provider") navigate("/provider");
      else navigate("/customer");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast({ title: "Registration failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-elevated p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">LocalServ</span>
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-foreground">Join LocalServ</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your account to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                Full Name
              </Label>
              <div className="relative mt-2">
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`input-modern w-full ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {!errors.name && name && (
                  <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.name && (
                <p id="name-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email Address
              </Label>
              <div className="relative mt-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`input-modern w-full ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {!errors.email && email && (
                  <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`input-modern w-full pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                At least 6 characters
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <Label htmlFor="role" className="text-sm font-semibold text-foreground">
                Account Type
              </Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="mt-2 input-modern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">
                    <span>Customer - Looking for services</span>
                  </SelectItem>
                  <SelectItem value="provider">
                    <span>Service Provider - Offering services</span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Provider Location Tip */}
              {role === "provider" && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    You'll be able to add your service location after registration from your dashboard to appear in customer searches.
                  </p>
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                Phone (Optional)
              </Label>
              <Input
                id="phone"
                placeholder="555-0100"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 input-modern"
              />
            </div>

            {/* Location Field */}
            <div>
              <Label htmlFor="location" className="text-sm font-semibold text-foreground">
                Location (Optional)
              </Label>
              <Input
                id="location"
                placeholder="New York"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-2 input-modern"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-md hover:shadow-lg transition-shadow mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-muted-foreground">Already a member?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link to="/login">
            <Button variant="outline" className="w-full h-11 font-semibold">
              Sign in to your account
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
