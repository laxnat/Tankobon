// app/api/profile/name/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""

    if (!name || name.length > 50) {
        return NextResponse.json({ error: "Name must be 1-50 characters" }, { status: 400 })
    }

    const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
        select: { name: true },
    })

    return NextResponse.json({ name: updated.name })

    
}