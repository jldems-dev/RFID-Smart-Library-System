import { NextRequest } from 'next/server'
import { BookService } from '@/lib/api/services/book-service'
import { handleApiError } from '@/lib/api/error-handler'
import { validatePagination } from '@/lib/api/validation'
import { createdResponse, paginatedResponse } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const book = await BookService.createBook(data)
    return createdResponse(book, 'Book created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const { page: pageNum, limit: limitNum } = validatePagination(page, limit)

    const { books, total } = await BookService.getBooks(pageNum, limitNum, {
      status: status || undefined,
      search: search || undefined,
    })

    return paginatedResponse(books, total, pageNum, limitNum)
  } catch (error) {
    return handleApiError(error)
  }
}
