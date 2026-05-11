import { NextRequest } from 'next/server'
import { UserService } from '@/lib/api/services/user-service'
import { handleApiError } from '@/lib/api/error-handler'
import { successResponse, deletedResponse } from '@/lib/api/response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await UserService.getUserById(id)
    return successResponse(user)
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
    const user = await UserService.updateUser(id, data)
    return successResponse(user, 'User updated successfully')
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
    await UserService.deleteUser(id)
    return deletedResponse('User deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
