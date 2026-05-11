"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "TEACHER" | "ADMIN";
  joinDate: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<boolean | { requires2FA: true; tempToken: string }>;
  verify2FA: (tempToken: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateAdmin: (admin: AdminUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (
          parsedUser.role !== "STUDENT" ||
          parsedUser.role !== "TEACHER" ||
          parsedUser.role !== "STAFF"
        ) {
          setAdmin(parsedUser);
          setIsAuthenticated(true);
          document.cookie = `token=${localStorage.getItem("token")}; path=/; max-age=86400; SameSite=Lax`;
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        document.cookie = "token=; path=/; max-age=0";
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<boolean | { requires2FA: true; tempToken: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      const requires2FA = result.data.user.requires2FA;
      const tempToken = result.data.user.tempToken;

      // Check if 2FA is required
      if (requires2FA && tempToken) {
        return { requires2FA: requires2FA, tempToken: result.data.token };
      }

      if (result.data) {
        // Save session
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        setAdmin(result.data.user);
        setIsAuthenticated(true);

        // Set cookie
        document.cookie = `token=${result.data.token}; path=/; max-age=28800; SameSite=Lax`;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Add this new function for 2FA verification
  const verify2FA = async (
    tempToken: string,
    code: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, code }),
      });

      const result = await response.json();

      if (result.data) {
        // Save session (same as regular login)
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        setAdmin(result.data.user);
        setIsAuthenticated(true);

        // Set cookie
        document.cookie = `token=${result.data.token}; path=/; max-age=28800; SameSite=Lax`;
        return true;
      }

      return false;
    } catch (error) {
      console.error("2FA verification error:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setAdmin(null);
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
  };

  const updateAdmin = (updatedAdmin: AdminUser) => {
    setAdmin(updatedAdmin);
    localStorage.setItem("user", JSON.stringify(updatedAdmin));
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        isLoading,
        login,
        verify2FA, // Add this
        logout,
        updateAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
