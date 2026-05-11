"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, RotateCw, Tag, Send, Users } from "lucide-react";

// Hardcoded UI structure - only values come from API
const libraryKPIs = [
  {
    id: "total-books",
    label: "Total Books",
    icon: Plus,
    color: "primary",
  },
  {
    id: "available-books",
    label: "Available Books",
    icon: Tag,
    color: "green",
  },
  {
    id: "active-users",
    label: "Active Users",
    icon: Users,
    color: "primary",
  },
  {
    id: "checked-out",
    label: "Checked Out",
    icon: Send,
    color: "blue",
  },
  {
    id: "overdue",
    label: "Overdue",
    icon: RotateCw,
    color: "red",
  },
  {
    id: "returns-today",
    label: "Today's Returns",
    icon: BookOpen,
    color: "green",
  },
];

interface LibraryStatsData {
  totalBooks: number;
  availableBooks: number;
  totalUsers: number;
  activeCheckouts: number;
  overdueItems: number;
  returnsToday: number;
}

export default function LibraryStatistics() {
  const [values, setValues] = useState<LibraryStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLibraryStats() {
      try {
        const response = await fetch("/api/dashboard/library-stats");
        if (!response.ok) throw new Error("Failed to fetch");
        const data: LibraryStatsData = await response.json();
        setValues(data);
      } catch (error) {
        console.error("Error fetching library stats:", error);
        setValues(null);
      } finally {
        setLoading(false);
      }
    }

    fetchLibraryStats();

    // Refresh every 5 minutes
    const interval = setInterval(fetchLibraryStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Map values from API to KPIs
  const getKpiValue = (id: string): number => {
    if (!values) return 0;
    switch (id) {
      case "total-books":
        return values.totalBooks;
      case "available-books":
        return values.availableBooks;
      case "active-users":
        return values.totalUsers;
      case "checked-out":
        return values.activeCheckouts;
      case "overdue":
        return values.overdueItems;
      case "returns-today":
        return values.returnsToday;
      default:
        return 0;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="lg:col-span-3">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Library Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {libraryKPIs.map((kpi) => (
            <Card key={kpi.id} className="animate-pulse">
              <CardHeader>
                <CardTitle>{kpi.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.label}
                    </p>
                    <div className="h-8 bg-muted rounded w-16 mt-1" />
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <kpi.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Render with hardcoded UI + database values
  return (
    <div className="lg:col-span-3">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Library Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {libraryKPIs.map((kpi) => (
          <Card key={kpi.id}>
            <CardHeader>
              <CardTitle>{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {getKpiValue(kpi.id)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 transition-colors">
                  {React.createElement(kpi.icon, {
                    className: `h-6 w-6 text-${kpi.color}`,
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
