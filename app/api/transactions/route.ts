import { NextRequest } from "next/server";
import { TransactionService } from "@/lib/api/services/transaction-service";
import { handleApiError } from "@/lib/api/error-handler";
import { validatePagination } from "@/lib/api/validation";
import { paginatedResponse } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);

    // Use your existing getTransactions but extend it to support search
    const { transactions, total } = await TransactionService.getTransactions(
      pageNum,
      limitNum,
      {
        status: status || undefined,
        type: type || undefined,
        search: search || undefined,
      },
    );

    return paginatedResponse(transactions, total, pageNum, limitNum);
  } catch (error) {
    return handleApiError(error);
  }
}
