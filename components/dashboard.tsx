"use client";

import React from "react";
import { useState } from "react";
import { Plus, BookOpen, RotateCw, UserPlus, Tag, Send } from "lucide-react";
import DashboardInsights from "./admin/dashboard-insights";
import LibraryStatistics from "./admin/library-statistics";
import RecentActivity from "./admin/recent-activity";
import QuickActions from "./admin/quick-actions";
import GuidedActionModal from "./admin/guided-action-modal";

interface DashboardMetrics {
  totalBooks: number;
  availableBooks: number;
  totalUsers: number;
  activeCheckouts: number;
  overdueItems: number;
  returnsToday: number;
}

interface KPI {
  id: string;
  label: string;
  icon: any;
  value: number;
  color?: string;
}

export default function Dashboard() {
  const [metrics] = useState<DashboardMetrics>({
    totalBooks: 4523,
    availableBooks: 3891,
    totalUsers: 287,
    activeCheckouts: 632,
    overdueItems: 12,
    returnsToday: 45,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "add-book" | "issue-book" | "return-book" | "add-user" | null
  >(null);

  const handleActionClick = (
    action: "add-book" | "issue-book" | "return-book" | "add-user",
  ) => {
    setSelectedAction(action);
    setModalOpen(true);
  };

  const quickActions = [
    {
      id: "add-user",
      label: "Add User",
      icon: UserPlus,
      description: "Create new students or staff",
    },
    {
      id: "add-book",
      label: "Add Book",
      icon: Plus,
      description: "Add new books to inventory",
    },
    {
      id: "issue-book",
      label: "Issue Book",
      icon: BookOpen,
      description: "Check out books to students",
    },
    {
      id: "return-book",
      label: "Return Book",
      icon: RotateCw,
      description: "Process book returns",
    },
  ];

  const kpis: KPI[] = [
    {
      id: "total-books",
      label: "Total Books",
      icon: Plus,
      value: metrics.totalBooks,
    },
    {
      id: "available-books",
      label: "Available Books",
      icon: Tag,
      value: metrics.availableBooks,
      color: "green",
    },
    {
      id: "active-users",
      label: "Active Users",
      icon: BookOpen,
      value: metrics.totalUsers,
    },
    {
      id: "checked-out",
      label: "Checked Out",
      icon: Send,
      value: metrics.activeCheckouts,
      color: "blue",
    },
    {
      id: "overdue",
      label: "Overdue",
      icon: RotateCw,
      value: metrics.overdueItems,
      color: "red",
    },
    {
      id: "returns-today",
      label: "Today's Returns",
      icon: Plus,
      value: metrics.returnsToday,
      color: "green",
    },
  ];

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground font-heading">
          Dashboard
        </h2>
        <p className="text-muted-foreground mt-2">
          Welcome back! Monitor library operations and access quick actions.
        </p>
      </div>

      {/* Key Insights Section */}
      <div className="mb-8">
        <DashboardInsights />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h3>
        <QuickActions onActionClick={handleActionClick} />
      </div>

      {/* Library Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LibraryStatistics />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 mt-4">
        <RecentActivity />
      </div>

      {/* Guided Action Modal */}
      <GuidedActionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        action={selectedAction}
      />
    </div>
  );
}
