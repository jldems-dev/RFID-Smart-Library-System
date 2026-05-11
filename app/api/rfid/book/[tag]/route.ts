import { NextRequest } from "next/server";
import { BookService } from "@/lib/api/services/book-service";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> },
) {
  try {
    const { tag } = await params;
    const book = await BookService.getBookByRfid(tag);
    return successResponse(book);
  } catch (error) {
    return handleApiError(error);
  }
}
