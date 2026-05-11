import { NextRequest } from "next/server";
import { UserService } from "@/lib/api/services/user-service";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await UserService.generate2FASecret(id);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { code, secret } = await request.json();
    const result = await UserService.verify2FASetup(id, code, secret);
    return successResponse(result, "2FA enabled successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await UserService.disable2FA(id);
    return successResponse(result, "2FA disabled successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
