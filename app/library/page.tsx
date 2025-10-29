"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, TrendingUp, TrendingDown, Calendar, Filter, Trash2 } from "lucide-react";

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

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("title");
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchLibrary();
  }, [filter]);

  // Sort library
  const sortedLibrary = [...library].sort((a, b) => {
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

  const openModal = (entry: LibraryEntry) => {
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
  };
  

  const closeModal = () => {
    setModalOpen(false);
    setCurrentEntry(null);
  };

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
      }
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/library?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        await fetchLibrary();
        return true;
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
    return false;
  };  

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-white-purple">Loading...</div>;

  const statuses = [
    { value: "ALL", label: "All Manga", count: library.length },
    { value: "READING", label: "Reading" },
    { value: "COMPLETED", label: "Completed" },
    { value: "PLAN_TO_READ", label: "Plan to Read" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "DROPPED", label: "Dropped" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READING": return "text-green-400";
      case "COMPLETED": return "text-blue-400";
      case "PLAN_TO_READ": return "text-gray-400";
      case "ON_HOLD": return "text-yellow-400";
      case "DROPPED": return "text-red-400";
      default: return "text-white-purple";
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            {session ? (
              <h1 className="text-5xl font-bold text-white mb-2">{session.user?.name}'s Library</h1>
            ) : (
              <h1 className="text-5xl font-bold text-white mb-2">My Library</h1>
            )}
            <p className="text-white-purple">{library.length} manga in collection</p>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sleek Sidebar */}
          <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="bg-light-navy/30 backdrop-blur-sm rounded-2xl p-6 border border-white/5 sticky top-24">
              {/* Status Filter */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-white-purple" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">Filter</h3>
                </div>
                <div className="space-y-1">
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setFilter(status.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        filter === status.value
                          ? "bg-blue-900 text-white shadow-lg"
                          : "text-white-purple hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{status.label}</span>
                        {filter === status.value && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-white-purple" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">Sort</h3>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setSortBy("title")}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      sortBy === "title"
                        ? "bg-blue-900 text-white shadow-lg"
                        : "text-white-purple hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="font-medium">Title (A-Z)</span>
                  </button>
                  <button
                    onClick={() => setSortBy("score-high")}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      sortBy === "score-high"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-white-purple hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="font-medium">Highest Rated</span>
                  </button>
                  <button
                    onClick={() => setSortBy("score-low")}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      sortBy === "score-low"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-white-purple hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="font-medium">Lowest Rated</span>
                  </button>
                  <button
                    onClick={() => setSortBy("recent")}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      sortBy === "recent"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-white-purple hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="font-medium">Recently Updated</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {sortedLibrary.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-white-purple text-lg mb-4">No manga found</div>
                <p className="text-white-purple/60">Try adjusting your filters</p>
              </div>
            ) : (
              <div>
                {/* Column Headers */}
                <div className="hidden lg:flex items-center gap-6 px-4 pb-3 mb-2 border-b border-white/10">
                  <div className="w-14"></div> {/* Image space */}
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
                  <div className="w-32 hidden xl:block"></div> {/* Progress bar space */}
                </div>

                {/* List Items */}
                <div className="space-y-2">
                  {sortedLibrary.map((entry) => (
                    <div
                      key={entry.id}
                      className="group relative bg-light-navy/30 backdrop-blur-sm hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-6 p-4">
                        {/* Cover Image */}
                        <div className="relative flex-shrink-0">
                          {entry.imageUrl && (
                            <>
                              {/* Small preview */}
                              <div className="w-14 h-20 rounded-lg overflow-hidden">
                                <Image
                                  src={entry.imageUrl}
                                  alt={entry.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              {/* Edit button on hover - only shows when hovering the small image */}
                              <button
                                onClick={() => openModal(entry)}
                                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg z-10"
                              >
                                <span className="text-white text-2xl">⋯</span>
                              </button>

                              {/* Large hover preview */}
                              <div className="absolute left-[-140px] top-1/2 -translate-y-1/2 w-28 h-40 rounded-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl z-20 border-2 border-white/20 pointer-events-none">
                                <Image
                                  src={entry.imageUrl}
                                  alt={entry.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        {/* Title - Fixed width */}
                        <div className="w-[500px]">
                          <h3 className="text-white font-bold text-lg truncate group-hover:text-blue-400 transition-colors">
                            {entry.title}
                          </h3>
                          <div className={`text-sm font-medium truncate ${getStatusColor(entry.status)}`}>
                            {entry.status.replace(/_/g, " ")}
                          </div>
                        </div>

                        {/* Score - Fixed width */}
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

                        {/* Chapters - Fixed width */}
                        <div className="w-28 text-center flex-shrink-0">
                          <div className="text-white font-medium">
                            {entry.chaptersRead || 0}
                            / 
                            {entry.totalChapters 
                              ? <span className="text-white-purple">{entry.totalChapters}</span>
                              : "-"}
                          </div>
                        </div>

                        {/* Volumes - Fixed width */}
                        <div className="w-24 text-center flex-shrink-0">
                          <span className="text-white-purple">
                            {entry.volumesRead || 0}
                            / 
                            {entry.totalVolumes 
                              ? <span className="text-white-purple">{entry.totalVolumes}</span>
                              : "-"}
                          </span>
                        </div>

                        {/* Collected - Fixed width */}
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
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-light-navy border border-white/5 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Fixed Edit Modal Header */}
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <h2 className="text-2xl font-bold text-white">Edit Entry</h2>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-white-purple text-sm mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="READING">Reading</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PLAN_TO_READ">Plan to Read</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="DROPPED">Dropped</option>
                </select>
              </div>

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

                {/* Text input for adding owned volumes when totalVolumes unknown */}
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
            </div>

            {/* Fixed Edit Modal Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={async () => {
                  if (!currentEntry) return;
                  const confirmed = confirm("Remove this manga from your library?");
                  if (!confirmed) return;
            
                  const success = await deleteEntry(currentEntry.id);
                  if (success) closeModal();
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
    </div>
  );
}