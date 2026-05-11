import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/api/services/auth-service' 

export const runtime = "nodejs"; // required for jsonwebtoken

export async function POST(request: NextRequest) {
  console.log("LOGIN API CALLED");

  try {
    const data = await request.json()

    const auth = await AuthService.login(data)

    return NextResponse.json({
      success: true,
      message: 'Login successfully',
      data: auth
    })
  } catch (error: any) {
    console.error("LOGIN ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
        status: error.status || 500
      },
      { status: error.status || 500 }
    )
  }
}