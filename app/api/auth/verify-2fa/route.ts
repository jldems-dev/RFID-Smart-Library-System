// app/api/auth/verify-2fa/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/api/services/auth-service";

export const runtime = "nodejs"; // required for jsonwebtoken

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const auth = await AuthService.verify2FA(data);

    return NextResponse.json({
      success: true,
      message: "2FA verification successful",
      data: auth,
    });
  } catch (error: any) {
    console.error("2FA VERIFICATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
        status: error.status || 500,
      },
      { status: error.status || 500 },
    );
  }
}
