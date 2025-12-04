// app/api/manga/top/route.ts

import { NextResponse } from "next/server";

{/* Retrieve manga in top manga section */}
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
        titleEnglish: manga.title_english,
        imageUrl: manga.images?.jpg?.large_image_url || "",
        synopsis: manga.synopsis,
        score: manga.score,
        chapters: manga.chapters,
        volumes: manga.volumes,
        status: manga.status,
        publishedFrom: manga.published?.from,
        publishedTo: manga.published?.to,
        authors:
          manga.authors?.map((author: any) => ({
            name: author.name,
            malId: author.mal_id,
          })) || [],
        genres: manga.genres?.map((genre: any) => genre.name) || [],
      })),
      pagination: data.pagination,
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