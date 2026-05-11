import { NextRequest, NextResponse } from "next/server";
import { RfidService } from "@/lib/api/services/rfid-service";
import { handleApiError } from "@/lib/api/error-handler";
import { createdResponse, paginatedResponse } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const rfid = await RfidService.createRfid(data);
    return createdResponse(rfid, "Rfid created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
