// app/api/profile/stats/genres/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch genres
    const entries = await prisma.mangaLibrary.findMany({
        where: { userId: session.user.id },
        select: { genres: true },
    })

    const genreCounts: Record<string, number> = {};
    for (const entry of entries) {
        for (const genre of entry.genres) {
            genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
        }
    }

    const sorted = Object.entries(genreCounts).map(([genre, count]) => ({ genre, count })).sort((a, b) => b.count - a.count);

    return NextResponse.json({ genres: sorted });
}