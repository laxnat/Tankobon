import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const entries = await prisma.mangaLibrary.findMany({
    where: {
      userId: user.id,
      updatedAt: { gte: thirtyDaysAgo },
    },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      chaptersRead: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  const items = entries.map((e) => ({
    id: e.id,
    title: e.title,
    imageUrl: e.imageUrl,
    change: e.chaptersRead > 0 ? `Ch. ${e.chaptersRead} read` : "Added to library",
    at: relativeTime(e.updatedAt),
  }));

  return NextResponse.json({ items });
}
