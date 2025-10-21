// app/api/library/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch user's library
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const library = await prisma.mangaLibrary.findMany({
      where: {
        userId: user.id,
        ...(status && { status: status as any }),
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ library });
  } catch (error) {
    console.error("Error fetching library:", error);
    return NextResponse.json(
      { error: "Failed to fetch library" },
      { status: 500 }
    );
  }
}

// POST - Add manga to library
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { malId, title, imageUrl, status, totalChapters } = body;

    if (!malId || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if already in library
    const existing = await prisma.mangaLibrary.findUnique({
      where: {
        userId_malId: {
          userId: user.id,
          malId: parseInt(malId),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Manga already in library" },
        { status: 409 }
      );
    }

    const libraryEntry = await prisma.mangaLibrary.create({
      data: {
        userId: user.id,
        malId: parseInt(malId),
        title,
        imageUrl,
        status: status || "PLAN_TO_READ",
        totalChapters: totalChapters ? parseInt(totalChapters) : null,
      },
    });

    return NextResponse.json({ entry: libraryEntry }, { status: 201 });
  } catch (error) {
    console.error("Error adding to library:", error);
    return NextResponse.json(
      { error: "Failed to add to library" },
      { status: 500 }
    );
  }
}

// PATCH - Update library entry
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { id, status, rating, chaptersRead, notes, startedAt, completedAt } = body;

    if (!id) {
      return NextResponse.json({ error: "Entry ID required" }, { status: 400 });
    }

    const updatedEntry = await prisma.mangaLibrary.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        ...(status && { status }),
        ...(rating !== undefined && { rating }),
        ...(chaptersRead !== undefined && { chaptersRead }),
        ...(notes !== undefined && { notes }),
        ...(startedAt !== undefined && { startedAt: startedAt ? new Date(startedAt) : null }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
      },
    });

    return NextResponse.json({ entry: updatedEntry });
  } catch (error) {
    console.error("Error updating library entry:", error);
    return NextResponse.json(
      { error: "Failed to update library entry" },
      { status: 500 }
    );
  }
}

// DELETE - Remove from library
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Entry ID required" }, { status: 400 });
    }

    await prisma.mangaLibrary.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting library entry:", error);
    return NextResponse.json(
      { error: "Failed to delete library entry" },
      { status: 500 }
    );
  }
}