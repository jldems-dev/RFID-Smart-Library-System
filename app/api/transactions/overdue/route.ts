import { NextRequest } from 'next/server'
import { TransactionService } from '@/lib/api/services/transaction-service'
import { handleApiError } from '@/lib/api/error-handler'
import { validatePagination } from '@/lib/api/validation'
import { paginatedResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')

    const { page: pageNum, limit: limitNum } = validatePagination(page, limit)

    const { transactions, total } = await TransactionService.getOverdueTransactions(
      pageNum,
      limitNum
    )

    return paginatedResponse(transactions, total, pageNum, limitNum, 'Overdue transactions')
  } catch (error) {
    return handleApiError(error)
  }
}
