import { NextRequest, NextResponse } from "next/server";
import { TransactionService } from "@/lib/api/services/transaction-service";
import { handleApiError } from "@/lib/api/error-handler";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const transaction = await TransactionService.borrowBook(data);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
