import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const handleApiError = (error: unknown) => {
  console.error('[API Error]', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.statusCode }
    )
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    },
    { status: 500 }
  )
}

export const validationError = (message: string) => {
  return new ApiError(400, message, 'VALIDATION_ERROR')
}

export const notFoundError = (resource: string) => {
  return new ApiError(404, `${resource} not found`, 'NOT_FOUND')
}

export const conflictError = (message: string) => {
  return new ApiError(409, message, 'CONFLICT')
}

export const unauthorizedError = (message = 'Unauthorized') => {
  return new ApiError(401, message, 'UNAUTHORIZED')
}
