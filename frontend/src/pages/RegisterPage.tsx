import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Wrench } from "lucide-react";
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
  const [role, setRole] = useState<UserRole>("customer");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const newUser = await register(name, email, password, role, phone, location);
      if (!newUser) {
        toast({ title: "Error", description: "Unable to create account", variant: "destructive" });
        return;
      }

      toast({
        title: "Account created!",
        description: role === "provider" ? "Your account is pending admin approval." : "Welcome to LocalServ!",
      });

      if (newUser.role === "admin") navigate("/admin");
      else if (newUser.role === "provider") navigate("/provider");
      else navigate("/customer");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">LocalServ</span>
          </Link>
          <h1 className="mt-8 text-3xl font-bold text-foreground">Get started</h1>
          <p className="mt-2 text-muted-foreground">Create your account in seconds</p>
        </div>
        
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="mt-2 border-border rounded-lg py-2.5" 
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="mt-2 border-border rounded-lg py-2.5" 
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="mt-2 border-border rounded-lg py-2.5" 
              />
            </div>
            <div>
              <Label className="text-sm font-semibold block">Account Type</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="mt-2 border-border rounded-lg py-2.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">👤 Customer</SelectItem>
                  <SelectItem value="provider">🔧 Service Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold">Phone (optional)</Label>
              <Input 
                id="phone" 
                placeholder="+1 (555) 000-0000" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="mt-2 border-border rounded-lg py-2.5" 
              />
            </div>
            <div>
              <Label htmlFor="location" className="text-sm font-semibold">Location (optional)</Label>
              <Input 
                id="location" 
                placeholder="New York, NY" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className="mt-2 border-border rounded-lg py-2.5" 
              />
            </div>
            <Button type="submit" className="w-full py-2.5 rounded-lg text-base font-semibold">Create Account</Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
