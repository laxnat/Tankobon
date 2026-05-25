"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ChevronDown, Loader2, LayoutList, LayoutGrid } from "lucide-react";
import { EditEntryModal } from "@/components/edit-entry-modal";
import type { LibraryEntry } from "@/components/edit-entry-modal";

// Memoized library item component
const LibraryItem = memo(({ 
  entry, 
  onEdit, 
  getStatusColor 
}: { 
  entry: LibraryEntry; 
  onEdit: (entry: LibraryEntry) => void;
  getStatusColor: (status: string) => string;
}) => {
  return (
    <div className="group relative bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300">
      <div className="flex items-center gap-6 p-4">
        {/* Cover Image */}
        <div className="relative flex-shrink-0">
          {entry.imageUrl && (
            <>
              <div className="w-14 h-20 rounded-lg overflow-hidden">
                <Image
                  src={entry.imageUrl}
                  alt={entry.title}
                  width={56}
                  height={80}
                  className="object-cover"
                  loading="lazy"
                />
              </div>

              <button
                onClick={() => onEdit(entry)}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg z-10"
              >
                <span className="text-white text-2xl">⋯</span>
              </button>
            </>
          )}
        </div>

        {/* Manga User Input Details */}
        <div className="w-[500px]">
          <Link href={`/manga/${entry.malId}`}>
            <h3 className="text-white font-bold text-lg truncate group-hover:text-blue-400 transition-colors">
              {entry.title}
            </h3>
          </Link>
          <div className={`text-sm font-medium truncate ${getStatusColor(entry.status)}`}>
            {entry.status.replace(/_/g, " ")}
          </div>
        </div>

        <div className="w-24 flex items-center justify-center gap-2 flex-shrink-0">
          {entry.rating ? (
            <>
              <Star className="w-4 h-4 fill-blue-400 text-blue-400" />
              <span className="text-white font-bold">{entry.rating}</span>
            </>
          ) : (
            <span className="text-white-purple">-</span>
          )}
        </div>

        <div className="w-28 text-center flex-shrink-0">
          <div className="text-white font-medium">
            {entry.chaptersRead || 0}
            / 
            {entry.totalChapters 
              ? <span className="text-white-purple">{entry.totalChapters}</span>
              : "-"}
          </div>
        </div>

        <div className="w-24 text-center flex-shrink-0">
          <span className="text-white-purple">
            {entry.volumesRead || 0}
            / 
            {entry.totalVolumes 
              ? <span className="text-white-purple">{entry.totalVolumes}</span>
              : "-"}
          </span>
        </div>

        <div className="w-28 text-center flex-shrink-0">
          {entry.totalVolumes ? (
            <span className="font-medium bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {Math.round((entry.ownedVolumes?.length / entry.totalVolumes) * 100)}%
            </span>
          ) : (
            <span className="font-medium bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {entry.ownedVolumes?.length || 0}/-
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

LibraryItem.displayName = "LibraryItem";

// Bookshelf view: a cover grid. Each card fills with the manga art; hovering reveals
// the title, status, and an edit button — keeping the grid uncluttered at rest.
const BookshelfView = memo(({
  entries,
  onEdit,
  getStatusColor,
}: {
  entries: LibraryEntry[];
  onEdit: (entry: LibraryEntry) => void;
  getStatusColor: (status: string) => string;
}) => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-4">
    {entries.map((entry) => (
      <div key={entry.id} className="group relative cursor-pointer" onClick={() => onEdit(entry)}>
        {/* Book cover */}
        <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-lg">
          {entry.imageUrl ? (
            <Image
              src={entry.imageUrl}
              alt={entry.title}
              fill
              sizes="110px"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            // Placeholder for entries without a cover
            <div className="w-full h-full bg-light-navy/60 flex items-center justify-center">
              <span className="text-white/20 text-xs text-center px-2">{entry.title}</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
            <p className="text-white text-xs font-semibold leading-snug line-clamp-3 mb-1">
              {entry.title}
            </p>
            <span className={`text-xs font-medium ${getStatusColor(entry.status)}`}>
              {entry.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Rating badge — shown only when rated */}
        {entry.rating && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 bg-black/70 rounded-md">
            <Star className="w-2.5 h-2.5 fill-blue-400 text-blue-400" />
            <span className="text-white text-[10px] font-bold">{entry.rating}</span>
          </div>
        )}
      </div>
    ))}
  </div>
));

BookshelfView.displayName = "BookshelfView";

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("title");
  const [view, setView] = useState<"list" | "bookshelf">("list");
  const [selectedEntry, setSelectedEntry] = useState<LibraryEntry | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchLibrary();
    }
  }, [status, router]);

  const fetchLibrary = async () => {
    try {
      const url = filter === "ALL" ? "/api/library" : `/api/library?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) setLibrary(data.library);
    } catch (error) {
      console.error("Error fetching library:", error);
      toast.error("Error fetching library.")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchLibrary();
  }, [filter]);

  // Memoized sorted library (only recalculates when library or sortBy changes)
  const sortedLibrary = useMemo(() => {
    return [...library].sort((a, b) => {
      switch (sortBy) {
        case "score-high":
          return (b.rating || 0) - (a.rating || 0);
        case "score-low":
          return (a.rating || 0) - (b.rating || 0);
        case "title":
          return a.title.localeCompare(b.title);
        case "recent":
          return 0;
        default:
          return 0;
      }
    });
  }, [library, sortBy]);

  const openModal = useCallback((entry: LibraryEntry) => {
    setSelectedEntry(entry);
  }, []);

  // Memoized status color function
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "READING": return "text-green-400";
      case "COMPLETED": return "text-blue-400";
      case "PLAN_TO_READ": return "text-gray-400";
      case "ON_HOLD": return "text-yellow-400";
      case "DROPPED": return "text-red-400";
      default: return "text-white-purple";
    }
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-white">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading...
      </div>
    );

  return (
    <div className="px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            {session ? (
              <h1 className="text-5xl font-display text-white mb-2">{session.user?.name}'s Library</h1>
            ) : (
              <h1 className="text-5xl font-bold text-white mb-2">My Library</h1>
            )}
            <div className="flex items-center gap-3">
              <p className="text-white-purple">{library.length} manga in collection</p>
              {!session?.user?.isPremium && library.length >= 50 && (
                <Link
                  href="/premium"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20 transition-colors"
                >
                  ★ Upgrade for unlimited
                </Link>
              )}
            </div>
          </div>

          {/* View toggle + Filter + Sort */}
          <div className="flex items-center gap-3">
            {/* List / Bookshelf toggle */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => setView("list")}
                title="List view"
                className={`p-1.5 rounded-lg transition-colors ${
                  view === "list" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("bookshelf")}
                title="Bookshelf view"
                className={`p-1.5 rounded-lg transition-colors ${
                  view === "bookshelf" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            {/* Status filter */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
              >
                <option value="ALL">All Manga</option>
                <option value="READING">Reading</option>
                <option value="COMPLETED">Completed</option>
                <option value="PLAN_TO_READ">Plan to Read</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="DROPPED">Dropped</option>
              </select>
              {/* ChevronDown overlaid on the right — pointer-events-none so clicks pass through to the select */}
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
              >
                <option value="title">Title (A–Z)</option>
                <option value="score-high">Highest Rated</option>
                <option value="score-low">Lowest Rated</option>
                <option value="recent">Recently Updated</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            </div>
          </div>
        </div>

        {/* Content */}
        {sortedLibrary.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-white-purple text-lg mb-4">No manga found</div>
            <p className="text-white-purple/60">Try adjusting your filters</p>
          </div>
        ) : view === "bookshelf" ? (
          <BookshelfView
            entries={sortedLibrary}
            onEdit={openModal}
            getStatusColor={getStatusColor}
          />
        ) : (
          <div>
            <div className="hidden lg:flex items-center gap-6 px-4 pb-3 mb-2 border-b border-white/10">
              <div className="w-14"></div>
              <div className="w-[500px]">
                <span className="text-white text-sm font-semibold uppercase tracking-wider">Title</span>
              </div>
              <div className="w-24 text-center">
                <span className="text-white text-sm font-semibold uppercase tracking-wider">Score</span>
              </div>
              <div className="w-28 text-center">
                <span className="text-white text-sm font-semibold uppercase tracking-wider">Chapters</span>
              </div>
              <div className="w-24 text-center">
                <span className="text-white text-sm font-semibold uppercase tracking-wider">Volumes</span>
              </div>
              <div className="w-28 text-center">
                <span className="text-white text-sm font-semibold uppercase tracking-wider">Collected</span>
              </div>
            </div>

            <div className="space-y-2">
              {sortedLibrary.map((entry) => (
                <LibraryItem
                  key={entry.id}
                  entry={entry}
                  onEdit={openModal}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <EditEntryModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onRefresh={fetchLibrary}
      />
    </div>
  );
}