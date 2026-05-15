"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ChevronDown, Loader2, Trash2, LayoutList, LayoutGrid } from "lucide-react";

interface LibraryEntry {
  id: string;
  malId: number;
  title: string;
  imageUrl: string | null;
  status: string;
  rating: number | null;
  chaptersRead: number | null;
  totalChapters: number | null;
  volumesRead: number | null;
  totalVolumes: number | null;
  ownedVolumes: number[];
  notes: string | null;
}

interface EditForm {
  status: string;
  rating: number;
  chaptersRead: number;
  volumesRead: number;
  ownedVolumes: number[];
  notes: string;
}

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
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<LibraryEntry | null>(null);
  const [ownedVolumesInput, setOwnedVolumesInput] = useState("");
  const [editForm, setEditForm] = useState<EditForm>({
    status: "",
    rating: 1,
    chaptersRead: 0,
    volumesRead: 0,
    ownedVolumes: [],
    notes: "",
  });

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

  // Memoized callback functions
  const openModal = useCallback((entry: LibraryEntry) => {
    setCurrentEntry(entry);
    setEditForm({
      status: entry.status,
      rating: entry.rating || 1,
      chaptersRead: entry.chaptersRead || 0,
      volumesRead: entry.volumesRead || 0,
      ownedVolumes: Array.isArray(entry.ownedVolumes) ? entry.ownedVolumes : [],
      notes: entry.notes || "",
    });
    setOwnedVolumesInput(
      Array.isArray(entry.ownedVolumes) ? entry.ownedVolumes.join(",") : ""
    );
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setCurrentEntry(null);
  }, []);

  const saveEdit = async () => {
    if (!currentEntry) return;
    try {
      const response = await fetch("/api/library", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentEntry.id,
          ...editForm,
        }),
      });

      if (response.ok) {
        setModalOpen(false);
        fetchLibrary();
        toast.success("Edit saved!")
      }
    } catch (error) {
      console.error("Error updating entry:", error);
      toast.error("Error updating entry.")
    }
  };

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const deleteEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/library?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        await fetchLibrary();
        toast.success("Manga deleted from library!")
        return true;
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Error deleting entry.")
    }
    return false;
  };

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

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 no-doc-scroll">
          <div className="bg-light-navy border border-white/5 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <h2 className="text-2xl font-bold text-white">Edit Entry</h2>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Status */}
              <div className="relative">
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full p-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="READING">Reading</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PLAN_TO_READ">Plan to Read</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="DROPPED">Dropped</option>
                </select>

                {/* Custom Arrow */}
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 pb-2 text-white/60">
                  ⌄
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-white-purple text-sm mb-2">Rating (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editForm.rating}
                  onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Chapters Read */}
              <div>
                <label className="block text-white-purple text-sm mb-2">Chapters Read</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.chaptersRead}
                  onChange={(e) => setEditForm({ ...editForm, chaptersRead: parseInt(e.target.value) })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Volumes Read */}
              <div>
                <label className="block text-white-purple text-sm mb-2">Volumes Read</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.volumesRead}
                  onChange={(e) => setEditForm({ ...editForm, volumesRead: parseInt(e.target.value) })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Volumes Owned */}
              <div>
                <label className="block text-white-purple text-sm mb-2">Volumes Owned</label>
                <div className="flex flex-wrap gap-2">
                  {currentEntry?.totalVolumes ? (
                    Array.from({ length: currentEntry.totalVolumes }, (_, i) => {
                      const volNum = i + 1;
                      const isOwned = editForm.ownedVolumes.includes(volNum);
                      return (
                        <button
                          key={volNum}
                          onClick={() => {
                            setEditForm(prev => ({
                              ...prev,
                              ownedVolumes: isOwned
                                ? prev.ownedVolumes.filter(v => v !== volNum)
                                : [...prev.ownedVolumes, volNum],
                            }));
                          }}
                          className={`w-8 h-8 rounded-lg text-sm font-medium ${
                            isOwned ? "bg-blue-500 text-white" : "bg-white/10 text-white"
                          }`}
                        >
                          {volNum}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-white-purple/60 italic">
                      Total volumes unknown – select owned volumes manually below.
                    </div>
                  )}
                </div>

                {/* Manual Volume Entry */}
                {!currentEntry?.totalVolumes && (
                  <input
                    type="text"
                    inputMode="text"
                    placeholder="Enter owned volumes, e.g., 1,3,5,7-10"
                    value={ownedVolumesInput}
                    onChange={(e) => setOwnedVolumesInput(e.target.value)}
                    onBlur={() => {
                      const expandedVolumes = ownedVolumesInput
                        .split(",")
                        .flatMap((part) => {
                          const range = part.trim().split("-");
                          if (range.length === 2) {
                            const start = parseInt(range[0]);
                            const end = parseInt(range[1]);
                            if (!isNaN(start) && !isNaN(end) && start <= end) {
                              return Array.from({ length: end - start + 1 }, (_, i) => start + i);
                            }
                          }
                          const num = parseInt(part.trim());
                          return !isNaN(num) ? [num] : [];
                        });

                      setEditForm((prev) => ({
                        ...prev,
                        ownedVolumes: Array.from(new Set(expandedVolumes)),
                      }));
                    }}
                    className="mt-2 w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                  />
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white-purple text-sm mb-2">Notes</label>
                <textarea
                  placeholder="Write your personal notes or impressions here..."
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full h-28 p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>
            </div>

            {/* Save/Cancel/Delete Buttons */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  if (!currentEntry) return;
                  setPendingDeleteId(currentEntry.id);
                  setConfirmDelete(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600/80 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-600/20 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] no-doc-scroll">
          <div className="bg-[#131621] p-6 rounded-xl border border-white/10 shadow-xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
            <p className="text-white-purple mb-6">
              Are you sure you want to remove this manga from your library?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  setPendingDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (!pendingDeleteId) return;

                  const success = await deleteEntry(pendingDeleteId);
                  if (success) {
                    setConfirmDelete(false);
                    setPendingDeleteId(null);
                    closeModal();
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}