import { NextRequest } from "next/server";
import { UserService } from "@/lib/api/services/user-service";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> },
) {
  try {
    const { tag } = await params;
    const student = await UserService.getUserByRfid(tag);
    return successResponse(student);
  } catch (error) {
    return handleApiError(error);
  }
}
