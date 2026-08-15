import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { act } from "react";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });
        if (!user) {
            return NextResponse.json({ error: "User not found"}, { status: 404});
        }

        // Only fetch the last 52 weeks with 7 day buffer
        const cutoff = new Date();
        cutoff.setUTCDate(cutoff.getUTCDate() - (52 * 7 + 7));
        cutoff.setUTCHours(0, 0, 0, 0);

        const rows = await prisma.readingActivity.findMany({
            where: {
                userId: user.id,
                date: { gte: cutoff },
            },
            select: { date: true, chapters: true },
            orderBy: { date: "asc" },
        });

        // Group by date sring
        const byDate = new Map<string, number>();
        for (const row of rows) {
            const key = row.date.toISOString().slice(0, 10);
            byDate.set(key, (byDate.get(key) ?? 0) + row.chapters);
        }

        // Shape react-activity-calendar expects: { date, count, level 0-4 }
        const activities = Array.from(byDate.entries()).map(([date, count]) => ({
            date,
            count,
            level: ( count >= 20 ? 4 : count >= 10 ? 3 : count >= 5 ? 2 : 1) as 0 | 1 | 2 | 3 | 4,
        }));

        return NextResponse.json({
            activities,
            streak: calculateStreak(byDate),
            totalChapters: Array.from(byDate.values()).reduce((sum, n) => sum + n, 0),
        });
    } catch (err) {
        console.error("Error fethcing activity:", err);
        return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
    }
}

function calculateStreak(byDate: Map<string, number>): number {
    let streak = 0;
    const cursor = new Date();
    cursor.setUTCHours(0, 0, 0, 0);

    const todayKey = cursor.toISOString().slice(0, 10);

    if (!byDate.has(todayKey)) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
        if (!byDate.has(cursor.toISOString().slice(0, 10))) return 0;
    }

    while (true) {
        const key = cursor.toISOString().slice(0, 10);
        if (!byDate.has(key)) break;
        streak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return streak;
}