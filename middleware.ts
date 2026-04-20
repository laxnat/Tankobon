// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    // getToken reads the JWT from the httpOnly cookie NextAuth sets
    // No DB hit here - this runs at the edge and must be fast
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    const { pathname } = request.nextUrl

    // -- Auth wall: must be logged in --
    const requiresAuth = pathname.startsWith("/profile") || pathname.startsWith("/library")
    if (requiresAuth && !token) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // -- Premium wall: must be a paying user --
    // Add dedicated premium-only sections here later
    

    return NextResponse.next()
}

// Only run middleware on these paths - never on static files or Next.js internals
export const config = {
    matcher: [
        "/profile/:path*",
        "/library/:path*",
        "/export/:path*",
        // Add more premium routes later
    ],
}