// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    // Explicitly set secureCookie so the Edge runtime looks for the right
    // cookie name. Without this, auto-detection from NEXTAUTH_URL can silently
    // fail in the Edge runtime and return null for a valid session.
    //   HTTP  → "next-auth.session-token"           (dev, secureCookie=false)
    //   HTTPS → "__Secure-next-auth.session-token"  (prod, secureCookie=true)
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
    })

    const { pathname } = request.nextUrl

    // -- Auth wall: must be logged in --
    const requiresAuth = pathname.startsWith("/dashboard") || pathname.startsWith("/library")
    if (requiresAuth && !token) {
        // Include callbackUrl so the login page can send the user back here
        // after a successful sign-in instead of always defaulting to /dashboard.
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // -- Premium wall: must be a paying user --
    // Add dedicated premium-only sections here later
    

    return NextResponse.next()
}

// Only run middleware on these paths - never on static files or Next.js internals
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/library/:path*",
        "/export/:path*",
        // Add more premium routes later
    ],
}