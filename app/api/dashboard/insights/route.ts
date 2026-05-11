import { DashboardService } from "@/lib/api/services/dashboard-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [metrics, recentAlerts] = await Promise.all([
      DashboardService.getAllMetrics(),
      DashboardService.getRecentAlerts(5),
    ]);

    return NextResponse.json({
      ...metrics,
      recentAlerts,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
