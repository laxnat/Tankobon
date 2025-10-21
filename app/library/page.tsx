"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface LibraryEntry {
  id: string;
  malId: number;
  title: string;
  imageUrl: string | null;
  status: string;
  rating: number | null;
  chaptersRead: number | null;
  totalChapters: number | null;
  notes: string | null;
}

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    status: "",
    rating: 0,
    chaptersRead: 0,
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
      const url = filter === "ALL" 
        ? "/api/library" 
        : `/api/library?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setLibrary(data.library);
      }
    } catch (error) {
      console.error("Error fetching library:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchLibrary();
    }
  }, [filter]);

  const startEdit = (entry: LibraryEntry) => {
    setEditingId(entry.id);
    setEditForm({
      status: entry.status,
      rating: entry.rating || 0,
      chaptersRead: entry.chaptersRead || 0,
      notes: entry.notes || "",
    });
  };

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch("/api/library", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ...editForm,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        fetchLibrary();
      }
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Remove this manga from your library?")) return;

    try {
      const response = await fetch(`/api/library?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchLibrary();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const statuses = ["ALL", "READING", "COMPLETED", "PLAN_TO_READ", "ON_HOLD", "DROPPED"];

  return (
    <div className="min-h-screen p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">My Library</h1>

        <div className="flex gap-2 mb-8 overflow-x-auto">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                filter === status
                  ? "font-bold bg-blue-600 text-white"
                  : "font-bold bg-white-purple text-gray hover:bg-blue-purple"
              }`}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {library.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No manga in your library yet. Start searching!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {library.map((entry) => (
              <div key={entry.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex">
                  <div className="relative w-32 h-48 flex-shrink-0">
                    {entry.imageUrl && (
                      <Image
                        src={entry.imageUrl}
                        alt={entry.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-lg mb-2">{entry.title}</h3>
                    
                    {editingId === entry.id ? (
                      <div className="space-y-2">
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full p-2 border rounded"
                        >
                          <option value="READING">Reading</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="PLAN_TO_READ">Plan to Read</option>
                          <option value="ON_HOLD">On Hold</option>
                          <option value="DROPPED">Dropped</option>
                        </select>

                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={editForm.rating}
                          onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                          placeholder="Rating (0-10)"
                          className="w-full p-2 border rounded"
                        />

                        <input
                          type="number"
                          min="0"
                          value={editForm.chaptersRead}
                          onChange={(e) => setEditForm({ ...editForm, chaptersRead: parseInt(e.target.value) })}
                          placeholder="Chapters read"
                          className="w-full p-2 border rounded"
                        />

                        <textarea
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          placeholder="Notes"
                          className="w-full p-2 border rounded"
                          rows={2}
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(entry.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Status: {entry.status.replace(/_/g, " ")}
                        </p>
                        {entry.rating && (
                          <p className="text-sm text-gray-600">Rating: ⭐ {entry.rating}/10</p>
                        )}
                        <p className="text-sm text-gray-600">
                          Progress: {entry.chaptersRead || 0}
                          {entry.totalChapters && `/${entry.totalChapters}`}
                        </p>
                        {entry.notes && (
                          <p className="text-sm text-gray-700 italic">{entry.notes}</p>
                        )}

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => startEdit(entry)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}