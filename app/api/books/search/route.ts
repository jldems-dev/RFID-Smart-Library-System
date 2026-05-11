import { NextRequest } from "next/server";
import { BookService } from "@/lib/api/services/book-service";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return successResponse([]);
    }

    const books = await BookService.searchBooks(query);
    return successResponse(books);
  } catch (error) {
    return handleApiError(error);
  }
}
