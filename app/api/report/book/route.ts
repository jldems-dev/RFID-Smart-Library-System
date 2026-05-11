import { NextRequest, NextResponse } from "next/server";
import { BookService } from "@/lib/api/services/book-service";
import { handleApiError } from "@/lib/api/error-handler";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (fromParam) {
      fromDate = new Date(fromParam);
      if (isNaN(fromDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid 'from' date" },
          { status: 400 },
        );
      }
    }

    if (toParam) {
      toDate = new Date(toParam);
      if (isNaN(toDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid 'to' date" },
          { status: 400 },
        );
      }
    }

    // Call your service to fetch books
    const data = await BookService.getAllBooks({
      startDate: fromDate,
      endDate: toDate,
    });

    const period =
      fromDate && toDate
        ? `${format(fromDate, "MMM dd")} - ${format(toDate, "MMM dd, yyyy")}`
        : "Last 30 days";

    return NextResponse.json({ data, period });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
