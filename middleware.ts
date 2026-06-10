// AUTH BYPASS: Authentication temporarily disabled for development
// To re-enable, uncomment the original code below and remove the bypass

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  // Passthrough - no auth check
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// --- ORIGINAL AUTH MIDDLEWARE (re-enable when login is fixed) ---
// import { withAuth } from "next-auth/middleware";
// export default withAuth({
//   pages: { signIn: "/login" },
// });
