"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ErrorBoundary } from "@/components/error-boundary";
import Navigation from "@/components/navigation";
import LoginPage from "@/components/login-page";
import Dashboard from "@/components/dashboard";
import BooksPage from "@/components/books-page";
import UsersPage from "@/components/users-page";
import TransactionsPage from "@/components/transactions-page";
import ReportPage from "@/components/report-page";
import ProfilePage from "@/components/profile-page";

export default function Home() {
  const { isAuthenticated, admin, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "books":
        return <BooksPage />;
      case "users":
        return <UsersPage />;
      case "transactions":
        return <TransactionsPage />;
      case "report":
        return <ReportPage />;
      case "profile":
        return admin && <ProfilePage admin={admin} setAdmin={() => {}} />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="pt-20">
        <ErrorBoundary>{renderPage()}</ErrorBoundary>
      </main>
    </div>
  );
}
