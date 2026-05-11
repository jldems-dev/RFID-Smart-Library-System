import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/api/services/user-service";
import { handleApiError } from "@/lib/api/error-handler";
import { validatePagination } from "@/lib/api/validation";
import { createdResponse, paginatedResponse } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await UserService.createUser(body);
    return createdResponse(user, "User created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const {
      page: pageNum,
      limit: limitNum,
      skip,
    } = validatePagination(page, limit);

    const { users, total } = await UserService.getUsers(pageNum, limitNum, {
      type: type || undefined,
      status: status || undefined,
      search: search || undefined,
    });

    return paginatedResponse(users, total, pageNum, limitNum);
  } catch (error) {
    return handleApiError(error);
  }
}
