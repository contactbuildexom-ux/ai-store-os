import { NextResponse } from "next/server";

const cookieName = "buildexom_mock_session";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Mock authentication is only available in development." }, { status: 404 });
  }

  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  if (body?.email !== "admin@buildexom.com" || body.password !== "123456") {
    return NextResponse.json({ error: "Invalid email or password. Use admin@buildexom.com / 123456." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, "local-admin", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export function DELETE() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Mock authentication is only available in development." }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}