"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Plus, Star, Search, ChevronDown } from "lucide-react";

interface Manga {
  malId: number;
  title: string;
  titleEnglish: string | null;
  imageUrl: string | null;
  authors: Array<{ name: string; malId?: number }> | null;
  synopsis: string;
  score: number;
  chapters: number | null;
  volumes: number | null;
  status: string;
  genres: string[];
}

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [topManga, setTopManga] = useState<Manga[]>([]);
  const [trendingManga, setTrendingManga] = useState<Manga[]>([]);
  const [showAllTop, setShowAllTop] = useState(false);
  const [showAllTrending, setShowAllTrending] = useState(false);

  const [typeFilter, setTypeFilter] = useState("manga");
  const [sortFilter, setSortFilter] = useState("score");
  const [statusFilter, setStatusFilter] = useState("any");
  const [adultFilter, setAdultFilter] = useState("sfw");

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Refs are stable across renders — perfect for timers and abort controllers
  // that need to be cancelled/replaced without triggering re-renders
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topResponse = await fetch('/api/manga/top');
        const topData = await topResponse.json();

        const trendingResponse = await fetch('/api/manga/trending');
        const trendingData = await trendingResponse.json();

        if (topResponse.ok) setTopManga(topData.results.slice(0, 20));
        if (trendingResponse.ok) setTrendingManga(trendingData.results.slice(0, 15));
      } catch (error) {
        console.error("Error fetching manga:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Core search function — takes an explicit snapshot of filters so it's safe
  // to call from inside a debounced closure without stale state issues
  async function searchManga(
    searchQuery: string,
    filters: { type: string; sort: string; status: string; adult: string }
  ) {
    // Cancel any request that's still in flight before starting a new one.
    // Without this, a slow earlier response could overwrite a faster newer one.
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: filters.type,
        sort: filters.sort,
        status: filters.status,
        adult: filters.adult,
      });
      const response = await fetch(`/api/manga/search?${params}`, {
        signal: abortRef.current.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to search");
      setResults(data.results);
    } catch (err) {
      // AbortError is expected — a newer search cancelled this one. Don't show an error.
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Debounced live search: fires 600ms after the user stops typing.
  // Also re-runs when filters change while there's an active query.
  // 600ms gives comfortable headroom under Jikan's 3 req/sec rate limit.
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Clear any pending debounce from the previous keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      searchManga(query, {
        type: typeFilter,
        sort: sortFilter,
        status: statusFilter,
        adult: adultFilter,
      });
    }, 600);

    // Cleanup: if the component unmounts mid-debounce, cancel the timer
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, typeFilter, sortFilter, statusFilter, adultFilter]);

  // Pressing Enter skips the 600ms wait and searches immediately
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchManga(query, {
      type: typeFilter,
      sort: sortFilter,
      status: statusFilter,
      adult: adultFilter,
    });
  };

  const triggerTopPopup = (message: string) => {
    setPopupMessage(message);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
      setPopupMessage("");
    }, 2500);
  };

  const addToLibrary = async (manga: Manga) => {
    if (!session) {
      triggerTopPopup("Please sign in to add manga to your library.")
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
          genres: manga.genres,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          triggerTopPopup("Already in your library!");
        } else {
          triggerTopPopup(data.error || "Failed to add manga.");
        }
        return;
      }

      triggerTopPopup("Added to Library!");
    } catch (err) {
      triggerTopPopup(err instanceof Error ? err.message : "An error occurred.")
    }
  };

  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPopupPosition = (index: number) => {
    if (windowWidth === 0) return 'left-full ml-2';
    if (windowWidth < 768) return 'hidden';

    let cols = 2;
    if (windowWidth >= 1280) cols = 6;
    else if (windowWidth >= 1024) cols = 5;
    else if (windowWidth >= 768) cols = 3;

    const columnIndex = (index % cols) + 1;
    const isLastColumn = columnIndex === cols;
    const isSecondToLastColumn = columnIndex === cols - 1;

    if (isLastColumn || isSecondToLastColumn) return 'right-full mr-2';
    return 'left-full ml-2';
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto mb-16">
        {/* ===================== SEARCH BAR + FILTERS ===================== */}
        <section className="mb-16">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row flex-wrap justify-center sm:justify-between items-center gap-4">
            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-3 bg-light-navy border border-white/5 rounded-lg px-3 py-2 flex-1 min-w-[250px] sm:min-w-[300px] lg:min-w-[400px]flex-shrink-0"
            >
              {/* Show spinner while searching, static icon otherwise */}
              {loading
                ? <Loader2 className="w-5 h-5 text-white/60 animate-spin flex-shrink-0" />
                : <Search className="w-5 h-5 text-white flex-shrink-0" />
              }
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search manga..."
                className="w-full bg-transparent border-0 focus:outline-none text-white placeholder-white/60 text-md"
              />
            </form>

            {/* Filters */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-3">
              {/* Type */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none pl-4 pr-9 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer capitalize"
                >
                  {["manga", "novel", "oneshot", "doujin", "manhwa", "manhua"].map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0E1118] capitalize">{opt}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortFilter}
                  onChange={(e) => setSortFilter(e.target.value)}
                  className="appearance-none pl-4 pr-9 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="score" className="bg-[#0E1118]">Score</option>
                  <option value="popularity" className="bg-[#0E1118]">Popularity</option>
                  <option value="newest" className="bg-[#0E1118]">Newest</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>

              {/* Status */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-4 pr-9 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer capitalize"
                >
                  {["any", "publishing", "complete", "hiatus", "discontinued"].map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0E1118] capitalize">{opt}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>

              {/* 18+ */}
              <div className="relative">
                <select
                  value={adultFilter}
                  onChange={(e) => setAdultFilter(e.target.value)}
                  className="appearance-none pl-4 pr-9 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="sfw" className="bg-[#0E1118]">Hide 18+</option>
                  <option value="all" className="bg-[#0E1118]">Show 18+</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Search Results */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {results.map((manga, index) => {
            const popupPosition = getPopupPosition(index);
            return (
              <div key={manga.malId} className="group relative">
                <Link href={`/manga/${manga.malId}`} className="block">
                  <div className="rounded-lg overflow-hidden transition-transform duration-300">
                    <div className="relative w-full aspect-[2/3] bg-[#0d0f16] transition-all rounded-lg overflow-hidden">
                      {manga.imageUrl && <Image src={manga.imageUrl} alt={manga.title} fill className="object-cover rounded-lg" />}
                    </div>
                    <div className="pt-2">
                      <h3 className="text-white text-sm line-clamp-2 text-left">{manga.title}</h3>
                    </div>
                  </div>
                </Link>
                <button onClick={() => addToLibrary(manga)}
                  className="absolute bottom-14 right-2 w-10 h-10 flex items-center justify-center bg-blue-600 font-bold text-white rounded-full hover:bg-blue-700 transition opacity-0 group-hover:opacity-100 shadow-lg z-10">
                  <Plus className="w-5 h-5" />
                </button>
                <MangaHoverCard manga={manga} popupPosition={popupPosition} />
              </div>
            );
          })}
        </div>

        {results.length === 0 && !loading && query.trim().length >= 2 && (
          <div className="text-center text-gray-500 mt-8">No results found</div>
        )}

        {!query.trim() && (
          <>
            {/* ===================== TOP MANGA ===================== */}
            <section className="max-w-7xl mx-auto mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display text-white tracking-wide">Top Manga</h2>
                <button onClick={() => setShowAllTop((prev) => !prev)}
                  className="text-blue-400 text-sm hover:underline hover:text-blue-300 transition">
                  {showAllTop ? "Show Less ↑" : "View All →"}
                </button>
              </div>
              <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 transition-all duration-500 ${showAllTop ? "max-h-[9999px]" : "max-h-[800px] overflow-hidden"}`}>
                {(showAllTop ? topManga : topManga.slice(0, 6)).map((manga, index) => {
                  const popupPosition = getPopupPosition(index);
                  return (
                    <div key={manga.malId} className="group relative">
                      <Link href={`/manga/${manga.malId}`} className="block">
                        <div className="rounded-lg overflow-hidden transition-transform duration-300">
                          <div className="relative w-full aspect-[2/3] bg-[#0d0f16] transition-all rounded-lg overflow-hidden">
                            {manga.imageUrl && <Image src={manga.imageUrl} alt={manga.title} fill className="object-cover rounded-lg" />}
                          </div>
                          <div className="pt-2">
                            <h3 className="text-white text-sm line-clamp-2 text-left group-hover:text-blue-400">{manga.title}</h3>
                          </div>
                        </div>
                      </Link>
                      <button onClick={() => addToLibrary(manga)}
                        className="absolute bottom-14 right-2 w-10 h-10 flex items-center justify-center bg-blue-600 font-bold text-white rounded-full hover:bg-blue-700 transition opacity-0 group-hover:opacity-100 shadow-lg z-10">
                        <Plus className="w-5 h-5" />
                      </button>
                      <MangaHoverCard manga={manga} popupPosition={popupPosition} />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ===================== TRENDING NOW ===================== */}
            <section className="max-w-7xl mx-auto mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display text-white tracking-wide">Trending Manga</h2>
                <button onClick={() => setShowAllTrending((prev) => !prev)}
                  className="text-blue-400 text-sm hover:underline hover:text-blue-300 transition">
                  {showAllTrending ? "Show Less ↑" : "View All →"}
                </button>
              </div>
              <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 transition-all duration-500 ${showAllTrending ? "max-h-[9999px]" : "max-h-[800px] overflow-hidden"}`}>
                {(showAllTrending ? trendingManga : trendingManga.slice(0, 6)).map((manga, index) => {
                  const popupPosition = getPopupPosition(index);
                  return (
                    <div key={manga.malId} className="group relative">
                      <Link href={`/manga/${manga.malId}`} className="block">
                        <div className="rounded-lg overflow-hidden transition-transform duration-300">
                          <div className="relative w-full aspect-[2/3] bg-[#0d0f16] transition-all rounded-lg overflow-hidden">
                            {manga.imageUrl && <Image src={manga.imageUrl} alt={manga.title} fill className="object-cover rounded-lg" />}
                          </div>
                          <div className="pt-2">
                            <h3 className="text-white text-sm line-clamp-2 text-left">{manga.title}</h3>
                          </div>
                        </div>
                      </Link>
                      <button onClick={() => addToLibrary(manga)}
                        className="absolute bottom-14 right-2 w-10 h-10 flex items-center justify-center bg-blue-600 font-bold text-white rounded-full hover:bg-blue-700 transition opacity-0 group-hover:opacity-100 shadow-lg z-10">
                        <Plus className="w-5 h-5" />
                      </button>
                      <MangaHoverCard manga={manga} popupPosition={popupPosition} />
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>

      {showPopup && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 animate-fadeIn">
            {popupMessage}
          </div>
        </div>
      )}
    </div>
  );
}

function MangaHoverCard({ manga, popupPosition }: { manga: Manga; popupPosition: string }) {
  return (
    <div className={`absolute top-0 w-64 bg-navy-blue rounded-lg border border-white/5 shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none ${popupPosition}`}>
      <div className="flex gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-white text-sm mb-1 line-clamp-2">{manga.title}</h3>
          {manga.titleEnglish && <p className="text-xs text-white-purple mb-2 line-clamp-2">{manga.titleEnglish}</p>}
          {manga.authors && manga.authors.length > 0 && (
            <p className="text-xs text-white-purple mb-2 truncate">
              {manga.authors.length === 1 ? "Author" : "Authors"}: {manga.authors.map(a => a.name).join(", ")}
            </p>
          )}
          <div className="flex items-center gap-2 mb-2 text-xs">
            <Star className="w-3 h-3 mb-0.5 fill-blue-400 text-blue-400" />
            <span className="font-display text-white-purple">{manga.score ? `${manga.score}` : "TBD"}</span>
            <span className="text-white-purple">{manga.chapters ? `${manga.chapters} ch` : "? ch"}</span>
            <span className="text-white-purple">{manga.volumes ? `${manga.volumes} vol` : "? vol"}</span>
          </div>
          {manga.status && <p className="text-xs text-white-purple">Status: {manga.status}</p>}
        </div>
      </div>
      {manga.genres && manga.genres.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {manga.genres.slice(0, 4).map((genre) => (
            <span key={genre} className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg">{genre}</span>
          ))}
        </div>
      )}
    </div>
  );
}
