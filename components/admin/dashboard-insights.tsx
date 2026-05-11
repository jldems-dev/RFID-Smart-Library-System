"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clock, Activity, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightMetrics {
  circulationRate: number;
  overdueBooks: number;
  todaysCheckouts: number;
  activeAlerts: number;
}

interface Alert {
  id: number;
  type: string;
  message: string;
  severity: "warning" | "info" | "error";
}

export default function DashboardInsights() {
  const [insights, setInsights] = useState<InsightMetrics>({
    circulationRate: 0,
    overdueBooks: 0,
    todaysCheckouts: 0,
    activeAlerts: 0,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/dashboard/insights");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();

        setInsights({
          circulationRate: data.circulationRate || 0,
          overdueBooks: data.overdueBooks || 0,
          todaysCheckouts: data.todaysCheckouts || 0,
          activeAlerts: data.activeAlerts || 0,
        });

        // Transform notifications into alerts format
        if (data.recentAlerts) {
          setAlerts(data.recentAlerts);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Row - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Circulation Rate */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Circulation Rate
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {insights.circulationRate}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  ↑ 5% vs last week
                </p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Overdue Items */}
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overdue Items
                </p>
                <p className="text-3xl font-bold text-destructive mt-2">
                  {insights.overdueBooks}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Requires action
                </p>
              </div>
              <Clock className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Checkouts - REPLACED System Health */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Today's Checkouts
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {insights.todaysCheckouts}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Books borrowed today
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Alerts
                </p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  {insights.activeAlerts}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Attention needed
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card className="bg-linear-to-r from-background to-background border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${
                  alert.severity === "warning"
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-l-yellow-500"
                    : alert.severity === "error"
                      ? "bg-red-50 dark:bg-red-900/20 border-l-red-500"
                      : "bg-blue-50 dark:bg-blue-900/20 border-l-blue-500"
                }`}
              >
                <div className="mt-1">
                  <AlertCircle
                    className={`h-5 w-5 ${
                      alert.severity === "warning"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : alert.severity === "error"
                          ? "text-red-600 dark:text-red-400"
                          : "text-blue-600 dark:text-blue-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">{alert.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No active alerts
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
