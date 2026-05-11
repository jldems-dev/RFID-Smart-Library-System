"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
  id: string;
  user: string;
  action: string;
  book: string;
  time: string;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const response = await fetch("/api/dashboard/recent-activity");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setActivities(data.activities || []);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentActivity();

    // Refresh every 2 minutes
    const interval = setInterval(fetchRecentActivity, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Empty state
  if (activities.length === 0) {
    return (
      <div className="lg:col-span-3">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Recent Activity
        </h3>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No recent activity available
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div>
                <p className="font-medium text-foreground">{activity.user}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.action} {activity.book}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
