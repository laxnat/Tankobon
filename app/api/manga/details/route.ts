import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const res = await fetch(`https://api.jikan.moe/v4/manga/${id}/full`);
    const data = await res.json();

    if (!res.ok) throw new Error("Failed to fetch from Jikan");

    const manga = data.data;

    return NextResponse.json({
      malId: manga.mal_id,
      title: manga.title,
      titleEnglish: manga.title_english,
      imageUrl: manga.images?.jpg?.large_image_url,
      synopsis: manga.synopsis,
      score: manga.score,
      rank: manga.rank,
      popularity: manga.popularity,
      chapters: manga.chapters,
      volumes: manga.volumes,
      status: manga.status,
      genres: manga.genres.map((g: any) => g.name),
      authors: manga.authors.map((a: any) => ({ name: a.name })),
      published: manga.published?.string,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch manga details" },
      { status: 500 }
    );
  }
}
