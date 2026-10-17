import { NextResponse } from "next/server";
import { getPlatformSettings } from "@/lib/platform-settings";

export async function GET() {
  return NextResponse.json({
    settings: await getPlatformSettings(),
  }, { headers: { "Cache-Control": "no-store" } });
}
