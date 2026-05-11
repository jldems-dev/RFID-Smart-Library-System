import { NextRequest } from "next/server";
import { UserService } from "@/lib/api/services/user-service";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return handleApiError(
        new Error("Current password and new password are required"),
      );
    }

    await UserService.updatePassword(id, currentPassword, newPassword);
    return successResponse({}, "Password updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
