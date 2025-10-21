"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Manga {
  malId: number;
  title: string;
  titleEnglish: string | null;
  imageUrl: string;
  authors: Array<{ name: string; malId?: number }> | null;
  synopsis: string;
  score: number;
  chapters: number | null;
  status: string;
  genres: string[];
}

export default function SearchPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/manga/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search");
      }

      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addToLibrary = async (manga: Manga) => {
    if (!session) {
      alert("Please sign in to add manga to your library");
      return;
    }

    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          malId: manga.malId,
          title: manga.title,
          imageUrl: manga.imageUrl,
          author: manga.authors?.[0]?.name || "Unknown",
          totalChapters: manga.chapters,
          status: "PLAN_TO_READ",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add to library");
      }

      alert("Added to library!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Search Manga</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for manga..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading Spinner Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Loader2 className="h-16 w-16 text-white animate-spin" />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map((manga) => (
            <div key={manga.malId} className="group relative">
              {/* Main Card - Image and Title */}
              <div className="rounded-lg overflow-hidden transition-transform group-hover:scale-105">
                <div className="relative w-full aspect-[2/3] bg-gray-100">
                  <Image
                    src={manga.imageUrl}
                    alt={manga.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-white text-sm line-clamp-2">{manga.title}</h3>
                </div>
              </div>

              {/* Hover Card - Additional Info */}
              <div className="absolute left-0 top-0 w-64 bg-dark-purple rounded-lg shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none group-hover:pointer-events-auto">
                <div className="flex gap-3 mb-3">
                  <div className="relative w-20 h-28 flex-shrink-0 bg-gray-100 rounded">
                    <Image
                      src={manga.imageUrl}
                      alt={manga.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{manga.title}</h3>
                    {manga.titleEnglish && (
                      <p className="text-xs text-white-purple mb-2 line-clamp-2">{manga.titleEnglish}</p>
                    )}
                    {manga.authors && manga.authors.length > 0 && (
                      <p className="text-xs text-white-purple mb-2">
                        {manga.authors.length === 1 ? "Author" : "Authors"}: {manga.authors.map(a => a.name).join(", ")}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      {manga.score && (
                        <span className="font-bold text-white-purple">
                          ⭐ {manga.score}
                        </span>
                      )}
                      <span className="text-white-purple">
                        {manga.chapters ? `${manga.chapters} chapter(s)` : "? chapter(s)"}
                      </span>
                    </div>
                    {manga.status && (
                      <p className="text-xs text-white-purple mb-2">Status: {manga.status}</p>
                    )}
                  </div>
                </div>

                {manga.genres && manga.genres.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {manga.genres.slice(0, 4).map((genre) => (
                        <span
                          key={genre}
                          className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs font-bold text-white-purple line-clamp-4 mb-3">
                  {manga.synopsis || "No synopsis available"}
                </p>

                <button
                  onClick={() => addToLibrary(manga)}
                  className="w-full px-4 py-2 bg-blue-600 font-bold text-white rounded hover:bg-blue-700 transition"
                >
                  Add to Library
                </button>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && query && (
          <div className="text-center text-gray-500 mt-8">No results found</div>
        )}
      </div>
    </div>
  );
}