import { NextRequest } from 'next/server'
import { TransactionService } from '@/lib/api/services/transaction-service'
import { handleApiError } from '@/lib/api/error-handler'
import { successResponse } from '@/lib/api/response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const transaction = await TransactionService.getTransactionById(id)
    return successResponse(transaction)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const transaction = await TransactionService.returnBook(id, data)
    return successResponse(transaction, 'Book returned successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
