import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchant-session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MERCHANT_SESSION_COOKIE)?.value;
  const session = verifyMerchantSession(token);

  return NextResponse.json({
    loggedIn: Boolean(session),
    slug: session?.slug || null,
    email: session?.email || null,
  });
}
