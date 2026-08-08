import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, UserRole } from "@/types";
import { apiRequest } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string, role: UserRole, phone: string, location: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiRequest<{ user: User }>("/auth/me");
        if (response?.user) {
          setUser(response.user);
        } else {
          localStorage.removeItem("auth_token");
          setUser(null);
        }
      } catch (error) {
        console.error("[v0] Auth bootstrap failed:", error);
        localStorage.removeItem("auth_token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const response = await apiRequest<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("auth_token", response.token);
    setUser(response.user);
    return response.user;
  };

  const register = async (name: string, email: string, password: string, role: UserRole, phone: string, location: string): Promise<User | null> => {
    const response = await apiRequest<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, phone, location }),
    });

    localStorage.setItem("auth_token", response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
