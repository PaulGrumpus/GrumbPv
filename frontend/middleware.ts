import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/profile"];

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const isProtected = PROTECTED.some((route) => req.nextUrl.pathname.startsWith(route));

    if (isProtected && !token) {
        return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*", "/invite/:path*", "/privacy/:path*", "/terms/:path*", "/faq/:path*"],
};