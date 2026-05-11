"use client";

import { BookOpen, RefreshCw, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityItem {
  id: string;
  type: "checkout" | "return" | "add-book" | "alert" | "system";
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  status?: "success" | "warning" | "error";
}

const activityIcons = {
  checkout: BookOpen,
  return: RefreshCw,
  "add-book": Plus,
  alert: AlertCircle,
  system: AlertCircle,
};

export default function ActivityLog() {
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "checkout",
      title: "Book Checked Out",
      description: '"The Great Gatsby" issued to Sarah Chen (ID: STU001)',
      timestamp: new Date(Date.now() - 5 * 60000),
      user: "System",
      status: "success",
    },
    {
      id: "2",
      type: "return",
      title: "Book Returned",
      description: '"1984" returned by Michael Brown (ID: STU002)',
      timestamp: new Date(Date.now() - 15 * 60000),
      user: "System",
      status: "success",
    },
    {
      id: "3",
      type: "add-book",
      title: "New Book Added",
      description: '5 copies of "Sapiens" added to inventory',
      timestamp: new Date(Date.now() - 45 * 60000),
      user: "Admin User",
      status: "success",
    },
    {
      id: "5",
      type: "alert",
      title: "Overdue Alert",
      description:
        '"Pride and Prejudice" overdue - reminder sent to Emma Wilson',
      timestamp: new Date(Date.now() - 3 * 60 * 60000),
      user: "System",
      status: "warning",
    },
  ];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Activity</span>
          <span className="text-sm font-normal text-muted-foreground">
            Last 24 hours
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {activities.map((activity, idx) => {
            const Icon = activityIcons[activity.type];
            const isLast = idx === activities.length - 1;
            const statusColors = {
              success: "text-green-600 dark:text-green-400",
              warning: "text-yellow-600 dark:text-yellow-400",
              error: "text-red-600 dark:text-red-400",
            };

            return (
              <div key={activity.id} className="flex gap-4 pb-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      activity.status === "warning"
                        ? "bg-yellow-100 dark:bg-yellow-900/30"
                        : activity.status === "error"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : "bg-green-100 dark:bg-green-900/30"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        statusColors[activity.status || "success"]
                      }`}
                    />
                  </div>
                  {!isLast && <div className="w-0.5 h-12 bg-border my-2" />}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <button className="w-full mt-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          View all activity
        </button>
      </CardContent>
    </Card>
  );
}
