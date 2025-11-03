"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Star } from "lucide-react";

interface TopManga {
  malId: number;
  title: string;
  imageUrl: string;
  score: number;
}

interface Manga {
  malId: number;
  title: string;
  titleEnglish: string | null;
  imageUrl: string;
  authors: Array<{ name: string; malId?: number }> | null;
  synopsis: string;
  score: number;
  chapters: number | null;
  volumes: number | null;
  status: string;
  genres: string[];
}

export default function SearchPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topManga, setTopManga] = useState<TopManga[]>([]);

  useEffect(() => {
    const fetchTopManga = async () => {
      try {
        const response = await fetch('/api/manga/top');
        const data = await response.json();
        
        if (response.ok) {
          setTopManga(data.results.slice(0, 20));
        }
      } catch (error) {
        console.error("Error fetching top manga:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopManga();
  }, []);

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
          totalVolumes: manga.volumes,
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

  const [windowWidth, setWindowWidth] = useState(0);

  // Track window width
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // Initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPopupPosition = (index: number) => {
    if (windowWidth === 0) return 'left-full ml-2'; // Default during SSR

    // Disable popup on small screens (less than 768px / md breakpoint)
    if (windowWidth < 768) return 'hidden';

    let cols = 2;
    if (windowWidth >= 1280) cols = 6;      // xl
    else if (windowWidth >= 1024) cols = 5; // lg
    else if (windowWidth >= 768) cols = 3;  // md
    else cols = 2;                          // default

    const columnIndex = (index % cols) + 1;
    const isLastColumn = columnIndex === cols;
    const isSecondToLastColumn = columnIndex === cols - 1;

    // Show on left if in last 2 columns, otherwise show on right
    if (isLastColumn || isSecondToLastColumn) {
      return 'right-full mr-2';
    }
    return 'left-full ml-2';
  };

  return (
    <div className="min-h-screen p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Search Manga</h1>

        {/* Scrollable Top Manga Section */}
        <section className="mb-20">
          {/* Title aligned to the same container as the scroller */}
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-3xl font-bold text-white mb-6">Top 20 Manga</h2>
          </div>

          {/* Scroller + fades inside the same bounding box */}
          <div className="relative mx-auto">
            {/* Fades that match the container edges */}
            <div className="pointer-events-none absolute left-[-2rem] top-0 h-full w-40 bg-gradient-to-r from-[#11111a] to-transparent z-10" />
            <div className="pointer-events-none absolute right-[-2rem] top-0 h-full w-40 bg-gradient-to-l from-[#11111a] to-transparent z-10" />

            {/* Scroll container with snap + scroll padding */}
            <div 
              className="overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth [scroll-padding-left:10.5rem] [scroll-padding-right:0]"
            >
              <div className="flex gap-8 pb-4">
                {/* Spacer before first card */}
                <div className="shrink-0 w-40" />

                {topManga.map((manga) => (
                  <div
                    key={manga.malId}
                    className="group relative flex-shrink-0 w-80 h-[500px] rounded-2xl border border-white/10 hover:border-white/30 transition-all cursor-pointer overflow-hidden snap-start"
                  >
                    <div className="relative w-full h-full rounded-2xl">
                      <Image
                        src={manga.imageUrl}
                        alt={manga.title}
                        fill
                        className="object-cover rounded-2xl transition-all duration-500"
                      />

                      {/* Dark overlay */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-black/40 to-transparent transition-all duration-500 group-hover:from-black/80 group-hover:via-black/60" />

                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white text-lg truncate max-w-[75%] leading-tight">
                            {manga.title}
                          </h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="w-4 h-4 fill-blue-400 text-blue-400" />
                            <span className="text-white font-bold text-sm">{manga.score}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Spacer after last card */}
                <div className="shrink-0 w-16" />
              </div>
            </div>
          </div>
        </section>

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
              className="px-6 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-900 disabled:opacity-50"
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
          {results.map((manga, index) => {
            const popupPosition = getPopupPosition(index);

            return (
              <div key={manga.malId} className="group relative">
                <div className="rounded-lg overflow-hidden transition-transform">
                  <div className="relative w-full aspect-[2/3] bg-gray-100">
                    <Image
                      src={manga.imageUrl}
                      alt={manga.title}
                      fill
                      className="object-cover"
                    />

                    <button
                      onClick={() => addToLibrary(manga)}
                      className="absolute bottom-2 right-2 w-10 h-10 flex items-center justify-center bg-blue-600 font-bold text-white rounded-full hover:bg-blue-700 transition opacity-0 group-hover:opacity-100 shadow-lg z-10"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-white text-sm line-clamp-2">{manga.title}</h3>
                  </div>
                </div>

                {/* Hover Card with dynamic positioning */}
                <div
                  className={`
                    absolute top-0 w-64 bg-light-navy rounded-lg border border-white/5
                    shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 z-10 pointer-events-none
                    ${popupPosition}
                  `}
                >
                  <div className="flex gap-3 mb-3">
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
                        <Star className="w-3 h-3 fill-blue-400 text-blue-400" />
                        <span className="font-bold text-white-purple">{manga.score}</span>
                        <span className="text-white-purple">
                          {manga.chapters ? `${manga.chapters} ch` : "? ch"}
                        </span>
                        <span className="text-white-purple">
                          {manga.volumes ? `${manga.volumes} vol` : "? vol"}
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
                </div>
              </div>
            );
          })}
        </div>

        {results.length === 0 && !loading && query && (
          <div className="text-center text-gray-500 mt-8">No results found</div>
        )}
      </div>
    </div>
  );
}