import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isPublic = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/api/auth",
    "/api/webhooks",
  ].some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const subStatus = session.user.subscriptionStatus;
  const isOnboarding = pathname.startsWith("/onboarding");
  const isAdmin = pathname.startsWith("/admin");
  const isDashboard = pathname.startsWith("/dashboard");

  if (isAdmin) return NextResponse.next();

  if (isDashboard && subStatus === "none") {
    return NextResponse.redirect(new URL("/onboarding/profile", req.url));
  }

  if (isDashboard && subStatus === "pending") {
    return NextResponse.redirect(new URL("/onboarding/payment", req.url));
  }

  if (isDashboard && subStatus === "payment_failed") {
    return NextResponse.next();
  }

  if (isDashboard && subStatus === "paused") {
    return NextResponse.redirect(new URL("/subscription-paused", req.url));
  }
  if (isDashboard && subStatus === "cancelled") {
    return NextResponse.redirect(new URL("/subscription-expired", req.url));
  }

  if (isOnboarding) return NextResponse.next();

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
