// app/api/library/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { count } from "console";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const statusCounts = await prisma.mangaLibrary.groupBy({
    by: ["status"],
    where: { userId },
    _count: { status: true },
  });

  const aggregates = await prisma.mangaLibrary.aggregate({
    where: { userId },
    _count: { id: true },
    _avg: { rating: true },
    _sum: {
      chaptersRead: true,
      volumesRead: true,
    },
  });

  const ownedData = await prisma.mangaLibrary.findMany({
    where: { userId },
    select: { ownedVolumes: true },
  });

  const totalOwnedVolumes = ownedData.reduce(
    (sum, e) => sum + (Array.isArray(e.ownedVolumes) ? e.ownedVolumes.length : 0), 0
  );

  const countByStatus = Object.fromEntries(statusCounts.map((row) => [row.status, row._count.status]));

  const avgRating = aggregates._avg.rating;

  // Return stats
  return NextResponse.json({
    total: aggregates._count.id,
    reading: countByStatus["READING"] ?? 0,
    completed: countByStatus["COMPLETED"] ?? 0,
    planToRead: countByStatus["PLAN_TO_READ"] ?? 0,
    onHold: countByStatus["ON_HOLD"] ?? 0,
    dropped: countByStatus["DROPPED"] ?? 0,
    avgRating: avgRating ? Number(avgRating.toFixed(2)) : 0,
    chaptersRead: aggregates._sum.chaptersRead ?? 0,
    volumesRead: aggregates._sum.volumesRead ?? 0, totalOwnedVolumes,
  });
}
