// app/api/manga/search/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";
  const type = searchParams.get("type") || "manga";     // e.g., manga | novel | oneshot | doujin | manhwa | manhua
  const sort = searchParams.get("sort") || "score";     // e.g., score | popularity | newest
  const status = searchParams.get("status") || "any";   // e.g., any | publishing | complete | hiatus | discontinued

  if (!query) {
    return NextResponse.json({ error: "Query parameter required" }, { status: 400 });
  }

  try {
    // Build Jikan API URL with filters
    let jikanUrl = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&page=${page}&limit=20&type=${type}`;

    // Map frontend sort filter to Jikan's ordering parameters
    if (sort === "score") jikanUrl += "&order_by=score&sort=desc";
    else if (sort === "popularity") jikanUrl += "&order_by=members&sort=desc";
    else if (sort === "newest") jikanUrl += "&order_by=start_date&sort=desc";

    // Apply status if not "any"
    if (status !== "any") {
      jikanUrl += `&status=${status}`;
    }

    const response = await fetch(jikanUrl, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Jikan API (${response.status})`);
    }

    const data = await response.json();

    // Format the response for the frontend
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
    console.error("Error fetching manga:", error);
    return NextResponse.json(
      { error: "Failed to search manga" },
      { status: 500 }
    );
  }
}
