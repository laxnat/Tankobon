// app/api/manga/top/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      'https://api.jikan.moe/v4/top/manga?limit=20',
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from Jikan API");
    }

    const data = await response.json();

    const formattedData = {
      results: data.data.map((manga: any) => ({
        malId: manga.mal_id,
        title: manga.title,
        imageUrl: manga.images.jpg.large_image_url,
        score: manga.score,
      })),
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching top manga:", error);
    return NextResponse.json(
      { error: "Failed to fetch top manga" },
      { status: 500 }
    );
  }
}