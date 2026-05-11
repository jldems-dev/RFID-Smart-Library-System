import { NextRequest, NextResponse } from "next/server";
import { TransactionService } from "@/lib/api/services/transaction-service";
import { handleApiError } from "@/lib/api/error-handler";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const transaction = await TransactionService.returnBook(data);
    return NextResponse.json(transaction, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
