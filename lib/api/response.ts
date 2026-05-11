import { NextResponse } from 'next/server'

interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export const successResponse = <T>(
  data: T,
  message = 'Success',
  status = 200
) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  )
}

export const paginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success'
) => {
  const pages = Math.ceil(total / limit)

  return NextResponse.json(
    {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
      } as PaginationMeta,
    },
    { status: 200 }
  )
}

export const createdResponse = <T>(data: T, message = 'Resource created successfully') => {
  return successResponse(data, message, 201)
}

export const deletedResponse = (message = 'Resource deleted successfully') => {
  return successResponse(null, message, 200)
}
