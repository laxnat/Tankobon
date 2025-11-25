"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Star, Search } from "lucide-react";

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
  const [topManga, setTopManga] = useState<Manga[]>([]);
  const [trendingManga, setTrendingManga] = useState<Manga[]>([]);
  const [showAllTop, setShowAllTop] = useState(false);
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [typeFilter, setTypeFilter] = useState("manga");
  const [sortFilter, setSortFilter] = useState("score");
  const [statusFilter, setStatusFilter] = useState("any");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch top manga
        const topResponse = await fetch('/api/manga/top');
        const topData = await topResponse.json();
  
        // Fetch trending manga
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
  

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/manga/search?q=${encodeURIComponent(query)}&type=${typeFilter}&sort=${sortFilter}&status=${statusFilter}`
      );
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

  // Clear search results
  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
    }
  }, [query]);  

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
      <div className="max-w-7xl mx-auto mb-16">
        {/* ===================== SEARCH BAR + FILTERS ===================== */}
        <section className="mb-16">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row flex-wrap justify-center sm:justify-between items-center gap-4">
            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-3 bg-light-navy border border-white/5 rounded-lg px-3 py-2 flex-1 min-w-[250px] sm:min-w-[300px] lg:min-w-[400px]flex-shrink-0"
            >
              <Search className="w-5 h-5 text-white" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search manga..."
                className="w-full bg-transparent border-0 focus:outline-none text-white placeholder-white/40 text-md font-bold"
              />
            </form>

            {/* Filters */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-md text-white/70">
              {/* Type Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowTypeMenu(!showTypeMenu);
                    setShowSortMenu(false);
                    setShowStatusMenu(false);
                  }}
                  className="bg-light-navy border border-white/5 rounded-md px-3 py-2 text-white/80 font-semibold hover:border-blue-500/40 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all cursor-pointer w-[200px] flex justify-between items-center"
                >
                  <span>
                    Type:{" "}
                    <span className="text-blue-400 capitalize">
                      {typeFilter.replace("_", " ")}
                    </span>
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white/60"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showTypeMenu && (
                  <div className="absolute mt-1 w-full bg-[#0E1118] border border-white/10 rounded-md shadow-lg z-20">
                    {["manga", "novel", "oneshot", "doujin", "manhwa", "manhua", ].map((option) => {
                      const isSelected = typeFilter === option;
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            setTypeFilter(option);
                            setShowTypeMenu(false);
                          }}
                          className={`block w-full text-left px-3 py-2 transition-colors duration-150 ${
                            isSelected
                              ? "text-blue-400 bg-blue-600/10"
                              : "text-white/80 hover:bg-blue-600/20"
                          } capitalize`}
                        >
                          {option.replace("_", " ")}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSortMenu(!showSortMenu);
                    setShowTypeMenu(false);
                    setShowStatusMenu(false);
                  }}
                  className="bg-light-navy border border-white/5 rounded-md px-3 py-2 text-white/80 font-semibold hover:border-purple-500/40 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all cursor-pointer w-[200px] flex justify-between items-center"
                >
                  <span>
                    Sort By:{" "}
                    <span className="text-purple-400 capitalize">
                      {sortFilter.replace("_", " ")}
                    </span>
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white/60"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showSortMenu && (
                  <div className="absolute mt-1 w-full bg-[#0E1118] border border-white/10 rounded-md shadow-lg z-20">
                    {["score", "popularity", "newest"].map((option) => {
                      const isSelected = sortFilter === option;
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            setSortFilter(option);
                            setShowSortMenu(false);
                          }}
                          className={`block w-full text-left px-3 py-2 transition-colors duration-150 ${
                            isSelected
                              ? "text-purple-400 bg-purple-600/10"
                              : "text-white/80 hover:bg-purple-600/20"
                          } capitalize`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowStatusMenu(!showStatusMenu);
                    setShowTypeMenu(false);
                    setShowSortMenu(false);
                  }}
                  className="bg-light-navy border border-white/5 rounded-md px-3 py-2 text-white/80 font-semibold hover:border-emerald-500/40 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all cursor-pointer w-[200px] flex justify-between items-center"
                >
                  <span>
                    Status:{" "}
                    <span className="text-emerald-400 capitalize">
                      {statusFilter.replace("_", " ")}
                    </span>
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white/60"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showStatusMenu && (
                  <div className="absolute mt-1 w-full bg-[#0E1118] border border-white/10 rounded-md shadow-lg z-20">
                    {["any", "publishing", "complete", "hiatus", "discontinued"].map((option) => {
                      const isSelected = statusFilter === option;
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            setStatusFilter(option);
                            setShowStatusMenu(false);
                          }}
                          className={`block w-full text-left px-3 py-2 transition-colors duration-150 ${
                            isSelected
                              ? "text-emerald-400 bg-emerald-600/10"
                              : "text-white/80 hover:bg-emerald-600/20"
                          } capitalize`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {results.map((manga, index) => {
            const popupPosition = getPopupPosition(index);

            return (
              <div className="group relative">
                <Link href={`/manga/${manga.malId}`} className="block">
                  <div className="rounded-lg overflow-hidden transition-transform duration-300">
                    <div className="relative w-full aspect-[2/3] bg-[#0d0f16] transition-all rounded-lg overflow-hidden">
                      <Image
                        src={manga.imageUrl}
                        alt={manga.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    
                    </div>
                    <div className="pt-2">
                      <h3 className="font-bold text-white text-sm line-clamp-2 text-left">{manga.title}</h3>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => addToLibrary(manga)}
                  className="absolute bottom-14 right-2 w-10 h-10 flex items-center justify-center bg-blue-600 font-bold text-white rounded-full hover:bg-blue-700 transition opacity-0 group-hover:opacity-100 shadow-lg z-10"
                >
                  <Plus className="w-5 h-5" />
                </button>

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

        {!query.trim() && (
          <>
            {/* ===================== TOP MANGA ===================== */}
            <section className="max-w-7xl mx-auto mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white tracking-wide">TOP MANGA</h2>
                <button
                  onClick={() => setShowAllTop((prev) => !prev)}
                  className="text-blue-400 text-sm font-medium hover:underline hover:text-blue-300 transition"
                >
                  {showAllTop ? "Show Less ↑" : "View All →"}
                </button>
              </div>

              <div
                className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 transition-all duration-500 ${
                  showAllTop ? "max-h-[9999px]" : "max-h-[800px] overflow-hidden"
                }`}
              >
                {(showAllTop ? topManga : topManga.slice(0, 6)).map((manga, index) => {
                  const popupPosition = getPopupPosition(index);
                  return (
                    <div className="group relative">
                      <Link href={`/manga/${manga.malId}`} className="block">
                        {/* Manga Card */}
                        <div className="rounded-lg overflow-hidden transition-transform duration-300 ">
                          <div className="relative w-full aspect-[2/3] bg-[#0d0f16] transition-all rounded-lg overflow-hidden">
                            <Image
                              src={manga.imageUrl}
                              alt={manga.title}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="pt-2">
                            <h3 className="font-bold text-white text-sm line-clamp-2 text-left group-hover:text-blue-400">{manga.title}</h3>
                          </div>
                        </div>
                      </Link>

                      <button
                        onClick={() => addToLibrary(manga)}
                        className="absolute bottom-14 right-2 w-10 h-10 flex items-center justify-center bg-blue-600 font-bold text-white rounded-full hover:bg-blue-700 transition opacity-0 group-hover:opacity-100 shadow-lg z-10"
                      >
                        <Plus className="w-5 h-5" />
                      </button>

                      {/* Hover Popup */}
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
                                {manga.authors.length === 1 ? "Author" : "Authors"}:{" "}
                                {manga.authors.map((a) => a.name).join(", ")}
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
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ===================== TRENDING NOW ===================== */}
            <section className="max-w-7xl mx-auto mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white tracking-wide">TRENDING NOW</h2>
                <button
                  onClick={() => setShowAllTrending((prev) => !prev)}
                  className="text-blue-400 text-sm font-medium hover:underline hover:text-blue-300 transition"
                >
                  {showAllTrending ? "Show Less ↑" : "View All →"}
                </button>
              </div>

              <div
                className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 transition-all duration-500 ${
                  showAllTrending ? "max-h-[9999px]" : "max-h-[800px] overflow-hidden"
                }`}
              >
                {(showAllTrending ? trendingManga : trendingManga.slice(0, 6)).map((manga, index) => {
                  const popupPosition = getPopupPosition(index);
                  return (
                    <div className="group relative">
                      <Link href={`/manga/${manga.malId}`} className="block">
                        <div className="rounded-lg overflow-hidden transition-transform duration-300">
                          <div className="relative w-full aspect-[2/3] bg-[#0d0f16] transition-all rounded-lg overflow-hidden">
                            <Image
                              src={manga.imageUrl}
                              alt={manga.title}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="pt-2">
                            <h3 className="font-bold text-white text-sm line-clamp-2 text-left">{manga.title}</h3>
                          </div>
                        </div>
                      </Link>

                      <button
                        onClick={() => addToLibrary(manga)}
                        className="absolute bottom-14 right-2 w-10 h-10 flex items-center justify-center bg-blue-600 font-bold text-white rounded-full hover:bg-blue-700 transition opacity-0 group-hover:opacity-100 shadow-lg z-10"
                      >
                        <Plus className="w-5 h-5" />
                      </button>

                      {/* Hover Popup */}
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
                                {manga.authors.length === 1 ? "Author" : "Authors"}:{" "}
                                {manga.authors.map((a) => a.name).join(", ")}
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
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
      {/* Success Popup */}
      {showPopup && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 animate-fadeIn">
            {popupMessage}
          </div>
        </div>
      )}
    </div>
  );
}