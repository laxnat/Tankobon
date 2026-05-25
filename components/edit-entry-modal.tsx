"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

// Types live here so both this component and the page can import them
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
  entry: LibraryEntry | null; // null = modal is closed
  onClose: () => void;
  onRefresh: () => void; // called after save/delete so the parent can refetch
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

  // Whenever the parent opens a different entry, reset form state to match it.
  // Without this, editing one manga and then opening another would show stale data.
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

  // Don't render anything when no entry is selected
  if (!entry) return null;

  const saveEdit = async () => {
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

  const deleteEntry = async () => {
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
      {/* Edit Modal */}
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
              onClick={onClose}
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

      {/* Delete Confirmation — z-[60] sits above the edit modal's z-50 */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] no-doc-scroll">
          <div className="bg-[#131621] p-6 rounded-xl border border-white/10 shadow-xl max-w-sm w-full text-center">
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
          </div>
        </div>
      )}
    </>
  );
}
