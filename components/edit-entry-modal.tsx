"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export interface LibraryEntry {
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

export interface EditForm {
  status: string;
  rating: number;
  chaptersRead: number;
  volumesRead: number;
  ownedVolumes: number[];
  notes: string;
}

interface EditEntryModalProps {
  entry: LibraryEntry | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function EditEntryModal({ entry, onClose, onRefresh }: EditEntryModalProps) {
  const [editForm, setEditForm] = useState<EditForm>({
    status: "",
    rating: 1,
    chaptersRead: 0,
    volumesRead: 0,
    ownedVolumes: [],
    notes: "",
  });
  const [ownedVolumesInput, setOwnedVolumesInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!entry) return;
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
    setConfirmDelete(false);
  }, [entry]);

  // Guards here instead of an early return — we can't early-return before the JSX
  // because AnimatePresence needs to always reach the return to play exit animations.
  const saveEdit = async () => {
    if (!entry) return;
    try {
      const response = await fetch("/api/library", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, ...editForm }),
      });
      if (response.ok) {
        toast.success("Edit saved!");
        onRefresh();
        onClose();
      }
    } catch (error) {
      console.error("Error updating entry:", error);
      toast.error("Error updating entry.");
    }
  };

  // Close on Escape key — standard modal accessibility behavior
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (entry) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [entry, onClose]);

  const deleteEntry = async () => {
    if (!entry) return;
    try {
      const response = await fetch(`/api/library?id=${entry.id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Manga deleted from library!");
        onRefresh();
        onClose();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Error deleting entry.");
    }
  };

  return (
    <>
      {/* AnimatePresence tracks when {entry} goes null and plays exit before unmounting */}
      <AnimatePresence>
        {entry && (
          <div
            key="edit-modal"
            className="fixed inset-0 z-50 no-doc-scroll"
            onClick={onClose}
          >
            {/* Backdrop — pointer-events-none so clicks pass through to the outer div */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/80 pointer-events-none"
            />

            {/* Content row — pointer-events-none on wrapper, restored on the inner content */}
            <div className="relative flex items-center justify-center h-full p-4 pointer-events-none">
              <div
                className="flex items-start gap-6 w-full max-w-2xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >

                {/* Animated cover — only shown on md+ screens */}
                {entry.imageUrl && (
                  <motion.div
                    initial={{ opacity: 0, x: -40, scale: 0.85, rotate: -4 }}
                    animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, x: -24, scale: 0.9 }}
                    // Spring feels physical; easing curves feel like UI
                    transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.05 }}
                    className="hidden md:flex flex-col items-center flex-shrink-0 w-44"
                  >
                    <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/70 ring-1 ring-white/10">
                      <Image
                        src={entry.imageUrl}
                        alt={entry.title}
                        width={176}
                        height={264}
                        className="object-cover w-full"
                        priority
                      />
                    </div>
                    <p className="text-white/60 text-xs mt-3 text-center line-clamp-2 font-medium px-1">
                      {entry.title}
                    </p>
                  </motion.div>
                )}

                {/* Form panel slides up slightly as it fades in */}
                <motion.div
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-light-navy border border-white/5 rounded-2xl shadow-2xl flex-1 flex flex-col max-h-[90vh]"
                >
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
                        onChange={(e) =>
                          setEditForm({ ...editForm, chaptersRead: parseInt(e.target.value) })
                        }
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
                        onChange={(e) =>
                          setEditForm({ ...editForm, volumesRead: parseInt(e.target.value) })
                        }
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    {/* Volumes Owned */}
                    <div>
                      <label className="block text-white-purple text-sm mb-2">Volumes Owned</label>
                      <div className="flex flex-wrap gap-2">
                        {entry.totalVolumes ? (
                          Array.from({ length: entry.totalVolumes }, (_, i) => {
                            const volNum = i + 1;
                            const isOwned = editForm.ownedVolumes.includes(volNum);
                            return (
                              <button
                                key={volNum}
                                onClick={() => {
                                  setEditForm((prev) => ({
                                    ...prev,
                                    ownedVolumes: isOwned
                                      ? prev.ownedVolumes.filter((v) => v !== volNum)
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

                      {!entry.totalVolumes && (
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
                                    return Array.from(
                                      { length: end - start + 1 },
                                      (_, i) => start + i
                                    );
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

                  <div className="p-6 border-t border-white/10 flex justify-end gap-3 flex-shrink-0">
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600/80 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-600/20 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation has its own AnimatePresence so it animates independently */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            key="confirm-delete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 flex items-center justify-center z-[60] no-doc-scroll"
          >
            <div className="absolute inset-0 bg-black/70" />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative bg-[#131621] p-6 rounded-xl border border-white/10 shadow-xl max-w-sm w-full text-center"
            >
              <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
              <p className="text-white-purple mb-6">
                Are you sure you want to remove this manga from your library?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteEntry}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
