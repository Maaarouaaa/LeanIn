import { NextResponse, type NextRequest } from "next/server";
import { DEMO_AUTH_COOKIE, DEMO_PROFILE_ID } from "@/lib/constants";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const existing = request.cookies.get(DEMO_AUTH_COOKIE)?.value;

  if (existing !== DEMO_PROFILE_ID) {
    response.cookies.set(DEMO_AUTH_COOKIE, DEMO_PROFILE_ID, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/.*).*)",
  ],
};
