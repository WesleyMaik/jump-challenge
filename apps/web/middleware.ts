import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const loginRoute = "/login";
	const allowRoutes = [loginRoute, "/signup"];
	const dashboardRoute = "/dashboard";
	const isAuthenticated = request.cookies.get("access_token ")?.value;

	if (isAuthenticated && allowRoutes.includes(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL(dashboardRoute, request.url));
	}

	if (!isAuthenticated && request.nextUrl.pathname.startsWith(dashboardRoute)) {
		return NextResponse.redirect(new URL(loginRoute, request.url));
	}

	return NextResponse.next();
}
export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
