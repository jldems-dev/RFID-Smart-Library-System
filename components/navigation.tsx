"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Navigation({
  currentPage,
  onPageChange,
}: NavigationProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "books", label: "Books", icon: "📚" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "transactions", label: "Transactions", icon: "🔄" },
    { id: "report", label: "Report", icon: "📈" },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Library Management System"
            className="h-12 w-auto"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground font-heading">
              RFID Smart Library System
            </h1>
            <p className="text-xs text-muted-foreground">
              Automated Book Tracking & Management
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === item.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange("profile")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === "profile"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary text-foreground"
            }`}
          >
            <span className="mr-2">👤</span>
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg font-medium transition-all hover:bg-destructive/10 text-foreground"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
