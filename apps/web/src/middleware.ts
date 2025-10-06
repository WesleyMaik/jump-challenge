import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const loginRoute = "/login";
	const allowRoutes = [loginRoute, "/signup"];
	const dashboardRoute = "/app";
	const isAuthenticated = request.cookies.get("access_token")?.value;

	// Se está autenticado e tenta acessar login/signup, redireciona para dashboard
	if (isAuthenticated && allowRoutes.includes(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL(dashboardRoute, request.url));
	}

	// Se NÃO está autenticado e NÃO está em rota permitida, redireciona para login
	if (!isAuthenticated && !allowRoutes.includes(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL(loginRoute, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
