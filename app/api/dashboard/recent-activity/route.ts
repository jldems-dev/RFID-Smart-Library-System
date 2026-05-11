import { RecentActivityService } from "@/lib/api/services/dashboard-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const bookId = searchParams.get("bookId");
    const limit = parseInt(searchParams.get("limit") || "10");

    let activities;

    if (userId) {
      activities = await RecentActivityService.getUserActivity(userId, limit);
    } else if (bookId) {
      activities = await RecentActivityService.getBookActivity(bookId, limit);
    } else {
      activities = await RecentActivityService.getRecentActivity(limit);
    }

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Recent activity API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 },
    );
  }
}
