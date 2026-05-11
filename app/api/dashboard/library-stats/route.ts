import { LibraryStatsService } from "@/lib/api/services/dashboard-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stats = await LibraryStatsService.getAllStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Library stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch library statistics" },
      { status: 500 },
    );
  }
}
