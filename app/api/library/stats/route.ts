// app/api/library/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch all user's library entries
  const entries = await prisma.mangaLibrary.findMany({
    where: { userId },
    select: { status: true, rating: true, updatedAt: true },
  });

  // Count entries by status
  const total = entries.length;
  const reading = entries.filter((e) => e.status === "READING").length;
  const completed = entries.filter((e) => e.status === "COMPLETED").length;
  const planToRead = entries.filter((e) => e.status === "PLAN_TO_READ").length;
  const onHold = entries.filter((e) => e.status === "ON_HOLD").length;
  const dropped = entries.filter((e) => e.status === "DROPPED").length;

  // Average rating
  const ratedEntries = entries.filter((e) => e.rating !== null);
  const avgRating =
    ratedEntries.length > 0
      ? ratedEntries.reduce((sum, e) => sum + (e.rating || 0), 0) /
        ratedEntries.length
      : 0;

  // Return stats
  return NextResponse.json({
    total,
    reading,
    completed,
    planToRead,
    onHold,
    dropped,
    avgRating: Number(avgRating.toFixed(2)),
  });
}
