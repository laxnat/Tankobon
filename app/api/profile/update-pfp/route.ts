// app/api/profile/update-pfp/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Update Prisma user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
