import { NextRequest } from 'next/server'
import { BookService } from '@/lib/api/services/book-service'
import { handleApiError } from '@/lib/api/error-handler'
import { successResponse, deletedResponse } from '@/lib/api/response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const book = await BookService.getBookById(id)
    return successResponse(book)
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
    const book = await BookService.updateBook(id, data)
    return successResponse(book, 'Book updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await BookService.deleteBook(id)
    return deletedResponse('Book deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
