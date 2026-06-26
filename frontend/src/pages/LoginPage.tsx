import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }

    try {
      const loggedInUser = await login(email, password);
      if (!loggedInUser) {
        toast({ title: "Error", description: "Unable to sign in", variant: "destructive" });
        return;
      }

      toast({ title: "Welcome back!" });
      if (loggedInUser.role === "admin") navigate("/admin");
      else if (loggedInUser.role === "provider") navigate("/provider");
      else navigate("/customer");
    } catch (error) {
      const description = error instanceof Error ? error.message : "Invalid credentials";
      toast({ title: "Error", description, variant: "destructive" });
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
          <h1 className="mt-8 text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to access your account</p>
        </div>
        
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" className="w-full py-2.5 rounded-lg text-base font-semibold">Sign In</Button>
          </form>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 mb-6">
          <p className="text-xs font-semibold text-primary mb-2">DEMO ACCOUNTS</p>
          <p className="text-xs text-muted-foreground">
            Email: <span className="font-mono">john@example.com</span><br/>
            Password: <span className="font-mono">password123</span>
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
