// app/api/manga/search/route.ts

import { NextRequest, NextResponse } from "next/server";

// Wraps fetch with a per-attempt timeout and exponential backoff retries
async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    // Each attempt gets 8 seconds before we give up and try again
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      // 5xx = transient server error → worth retrying. 4xx = our fault → don't retry.
      if (response.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 300 * Math.pow(2, attempt))); // 300ms, 600ms
        continue;
      }

      return response;
    } catch (err) {
      clearTimeout(timeout);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 300 * Math.pow(2, attempt)));
    }
  }
  throw new Error("All retries exhausted");
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";
  const type = searchParams.get("type") || "manga";     // e.g., manga | novel | oneshot | doujin | manhwa | manhua
  const sort = searchParams.get("sort") || "score";     // e.g., score | popularity | newest
  const status = searchParams.get("status") || "any";   // e.g., any | publishing | complete | hiatus | discontinued
  const adult = searchParams.get("adult") || "sfw";     // e.g. sfw | all

  if (!query) {
    return NextResponse.json({ error: "Query parameter required" }, { status: 400 });
  }

  try {
    let jikanUrl = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&page=${page}&limit=20&type=${type}`;

    if (sort === "score") jikanUrl += "&order_by=score&sort=desc";
    else if (sort === "popularity") jikanUrl += "&order_by=members&sort=desc";
    else if (sort === "newest") jikanUrl += "&order_by=start_date&sort=desc";

    if (status !== "any") jikanUrl += `&status=${status}`;

    // sfw=true filters adult content out. sfw=false lets everything through.
    jikanUrl += adult === "all" ? "&sfw=false" : "&sfw=true";

    const response = await fetchWithRetry(jikanUrl);

    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      results: data.data.map((manga: any) => ({
        malId: manga.mal_id,
        title: manga.title,
        titleEnglish: manga.title_english,
        imageUrl: manga.images?.jpg?.large_image_url || null,
        synopsis: manga.synopsis,
        score: manga.score,
        chapters: manga.chapters,
        volumes: manga.volumes,
        status: manga.status,
        publishedFrom: manga.published?.from,
        publishedTo: manga.published?.to,
        authors: manga.authors?.map((a: any) => ({ name: a.name, malId: a.mal_id })) || [],
        genres: manga.genres?.map((g: any) => g.name) || [],
      })),
      pagination: data.pagination,
    });
  } catch (error) {
    console.error("Error fetching manga:", error);
    const isTimeout = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { error: isTimeout ? "Search timed out — Jikan is slow right now. Try again." : "Failed to search manga" },
      { status: 500 }
    );
  }
}
