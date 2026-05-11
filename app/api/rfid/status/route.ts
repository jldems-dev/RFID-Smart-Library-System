import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const runtime = "nodejs";

export async function GET() {
  try {
    // Direct query for your specific device
    const { stdout } = await execAsync(
      `powershell -Command "Get-PnpDevice | Where-Object {$_.InstanceId -like '*VID_FFFF&PID_0035*' -and $_.Status -eq 'OK'} | Select-Object FriendlyName, InstanceId, Status | ConvertTo-Json"`,
    );

    if (!stdout.trim() || stdout.includes("null")) {
      return NextResponse.json({
        success: true,
        connected: false,
        message: "RFID Scanner Offline",
      });
    }

    const device = JSON.parse(stdout);

    return NextResponse.json({
      success: true,
      connected: true,
      scanner: {
        name: device.FriendlyName || "RFID Scanner",
        status: device.Status,
        vid: "FFFF",
        pid: "0035",
      },
      message: "RFID Scanner Connected • Ready to scan",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        connected: false,
        message: "RFID Scanner Offline",
        error: "Detection failed",
      },
      { status: 500 },
    );
  }
}
