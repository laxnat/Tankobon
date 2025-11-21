"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Star,
  BookOpen,
  Users,
  Plus,
  Check,
  Save,
} from "lucide-react";

interface MangaDetails {
  malId: number;
  title: string;
  titleEnglish: string | null;
  imageUrl: string;
  synopsis: string;
  score: number | null;
  rank: number | null;
  popularity: number | null;
  chapters: number | null;
  volumes: number | null;
  status: string;
  genres: string[];
  authors: Array<{ name: string }> | null;
  published: string | null;
}

export default function MangaDetailsPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const [manga, setManga] = useState<MangaDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const [entryId, setEntryId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Fetch manga details
  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/manga/details?id=${id}`);
        const data = await res.json();
        if (res.ok) setManga(data);
      } catch (err) {
        console.error("Failed to fetch manga details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  /* Fetch user's library entry + preload notes */
  useEffect(() => {
    if (!session || !manga) return;
  
    const fetchLibraryEntry = async () => {
      try {
        const res = await fetch(`/api/library?malId=${manga.malId}`);
        const data = await res.json();
  
        if (res.ok && data.entry) {
          const entry = data.entry;
  
          setEntryId(entry.id);
          setAdded(true);
  
          // Use notes from the database directly
          setNotes(entry.notes?.trim() ? entry.notes : "");
        } else {
          // Not in library
          setEntryId(null);
          setAdded(false);
          setNotes("");   // clear notes
        }
      } catch (err) {
        console.error("Failed to load library entry:", err);
        setEntryId(null);
        setAdded(false);
        setNotes("");
      }
    };
  
    fetchLibraryEntry();
  }, [session, manga]);  

  const triggerTopPopup = (message: string) => {
    setPopupMessage(message);
    setShowPopup(true);
  
    setTimeout(() => {
      setShowPopup(false);
      setPopupMessage("");
    }, 2500);
  };  

  /* Add to Library Handler */
  const addToLibrary = async () => {
    if (!session) {
      triggerTopPopup("Please sign in to add manga to your library.");
      return;
    }
    if (!manga) return;

    setAdding(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          malId: manga.malId,
          title: manga.title,
          imageUrl: manga.imageUrl,
          totalChapters: manga.chapters,
          totalVolumes: manga.volumes,
          status: "PLAN_TO_READ",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          triggerTopPopup("Already in your library!");
        } else {
          triggerTopPopup(data.error || "Failed to add manga.");
        }
        return;
      }

      const { entry } = await res.json();
      setEntryId(entry.id);
      setAdded(true);
      triggerTopPopup("Added to Library!");
    } catch (err) {
      console.error(err);
      triggerTopPopup(err instanceof Error ? err.message : "Error adding manga");
    } finally {
      setAdding(false);
    }
  };

  /* Save Notes Handler */
  const saveNotes = async () => {
    if (!session) {
      triggerTopPopup("Please sign in to save notes.");
      return;
    }
    if (!manga) return;

    setSavingNotes(true);
    try {
      // If no entryId yet, fetch it
      let idToUse = entryId;
      if (!idToUse) {
        const res = await fetch(`/api/library?malId=${manga.malId}`);
        const data = await res.json();
        if (!res.ok || !data.library?.length)
          triggerTopPopup(data.error || "Manga not found in your library.");
        idToUse = data.library[0].id;
        setEntryId(idToUse);
      }

      // Update notes by entry ID
      const res = await fetch("/api/library", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idToUse, notes: notes.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        triggerTopPopup(data.error || "Failed to save notes.");
      }

      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
      triggerTopPopup("Notes updated!");
    } catch (err) {
      console.error(err);
      triggerTopPopup(err instanceof Error ? err.message : "Error saving notes");
    } finally {
      setSavingNotes(false);
    }
  };


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Loader2 className="animate-spin w-8 h-8 mr-2" /> Loading...
      </div>
    );

  if (!manga)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Manga not found.
      </div>
    );

  return (
    <div className="min-h-screen pt-24 text-white max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row mb-12">
        {/* ===== LEFT COLUMN ===== */}
        <div className="flex flex-col items-center pr-6 space-y-6">
          {/* Cover Image */}
          <div className="relative w-64 h-96 rounded-xl overflow-hidden shadow-lg border border-white/5">
            <Image
              src={manga.imageUrl}
              alt={manga.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Add to Library Button */}
          <button
            onClick={addToLibrary}
            disabled={adding}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition w-64 ${
              added
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {adding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : added ? (
              <>
                <Check className="w-5 h-5" /> Added to Library
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" /> Add to Library
              </>
            )}
          </button>

          {/* Additional Info */}
          <div className="bg-light-navy/30 border border-white/5 rounded-xl p-3 shadow-lg w-64">
            <div className="flex flex-col gap-2 text-white text-md font-bold">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-400 fill-blue-400" />
                <span>Score: {manga.score ?? "N/A"}</span>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>
                  {manga.chapters ?? "?"} chapters / {manga.volumes ?? "?"} vols
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Rank #{manga.rank ?? "?"}</span>
              </div>

              <div>
                <div className="text-white mb-1">Genres</div>
                <div className="flex flex-col gap-1 text-white-purple font-semibold text-sm">
                  {manga.genres.join(", ")}
                </div>
              </div>

              <div>
                <div className="text-white mb-1">Status</div>
                <div className="text-white-purple font-semibold text-sm">
                  {manga.status}
                </div>
              </div>

              <div>
                <div className="text-white mb-1">Authors</div>
                <div className="flex flex-col gap-1 text-white-purple font-semibold text-sm">
                  {(manga.authors && manga.authors.length > 0
                    ? manga.authors.map((a) => a.name).join(", ")
                    : "Unknown") ?? "Unknown"}
                </div>
              </div>

              <div>
                <div className="text-white mb-1">Published</div>
                <div className="text-white-purple font-semibold text-sm">
                  {manga.published ?? "Unknown"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{manga.title}</h1>
          {manga.titleEnglish && (
            <p className="text-white-purple italic mb-3">
              {manga.titleEnglish}
            </p>
          )}

          {/* Synopsis */}
          <div className="bg-light-navy/30 border border-white/5 rounded-xl p-4 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-2">Synopsis</h2>
            <p className="text-white-purple leading-relaxed whitespace-pre-line">
              {manga.synopsis || "No synopsis available."}
            </p>
          </div>

          {/* Notes Section */}
          <div className="bg-light-navy/30 border border-white/5 rounded-xl p-4 shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-white">Your Notes</h2>
            <textarea
              placeholder="Write your personal notes or impressions here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-28 bg-[#0E1118] text-white rounded-lg p-3 border border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            <button
              onClick={saveNotes}
              disabled={savingNotes}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition bg-blue-600 hover:bg-blue-700 text-white"
            >
              {savingNotes ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : notesSaved ? (
                <>
                  <Check className="w-5 h-5" /> Notes Saved
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Notes
                </>
              )}
            </button>
          </div>
        </div>
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
