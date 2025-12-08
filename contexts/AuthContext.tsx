"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

interface User {
  id: string; // Changed from _id to id to match your usage
  name: string;
  email: string;
  role: "admin" | "user" | "tenant"; // Added tenant role
  profilePhoto?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null; // Add token to context
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // Add token state
  const [loading, setLoading] = useState(true);

  // Restore user and token on page refresh
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // -------------------------
  // REGISTER (SEND OTP)
  // -------------------------
  const register = async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success(data.message || "OTP sent to your email!");
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // VERIFY OTP
  // -------------------------
  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      toast.success("Registration completed successfully!");
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // LOGIN
  // -------------------------
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      toast.success("Login successful!");
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // UPDATE USER
  // -------------------------
  const updateUser = (updated: Partial<User>) => {
    if (!user) return;

    const newUser = { ...user, ...updated };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    toast.success("Profile updated!");
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // Now token is included
        login,
        register,
        verifyOtp,
        logout,
        loading,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// -------------------------
// HOOK
// -------------------------
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
