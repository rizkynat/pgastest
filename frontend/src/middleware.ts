import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const forbiddenRoles: Record<string, string[]> = {
}

function getForbiddenRoles(pathname: string): string[] | null {
    for (const route in forbiddenRoles) {
        if (pathname.startsWith(route)) {
            return forbiddenRoles[route];
        }
    }
    return null;
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;
    const pathname = request.nextUrl.pathname;
    const isLoginPage = pathname.startsWith("/auth");

    if (!token) {
        if (!isLoginPage) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
        return NextResponse.next();
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/me`, {
        headers: {
            Cookie: `access_token=${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const response = NextResponse.redirect(new URL("/auth/login", request.url));
        response.cookies.delete("access_token");
        return response;
    }

    const user = await res.json();

    const forbiddenRoles = getForbiddenRoles(pathname);
    if (forbiddenRoles?.includes(user.role)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (isLoginPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/auth/login", "/dashboard/:path*"],
};