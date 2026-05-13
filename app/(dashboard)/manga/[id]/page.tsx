"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Loader2,
  Star,
  BookOpen,
  Users,
  Plus,
  Check,
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

  const [entryId, setEntryId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

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
        } else {
          // Not in library
          setEntryId(null);
          setAdded(false);
        }
      } catch (err) {
        console.error("Failed to load library entry:", err);
        setEntryId(null);
        setAdded(false);
      }
    };

    fetchLibraryEntry();
  }, [session, manga]);

  /* Add to Library Handler */
  const addToLibrary = async () => {
    if (!session) {
      toast("Please sign in to add manga to your library.");
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
          genres: manga.genres,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast("Already in your library!");
        } else {
          toast.error(data.error || "Failed to add manga.");
        }
        return;
      }

      setEntryId(data.entry.id);
      setAdded(true);
      toast.success("Added to Library!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error adding manga");
    } finally {
      setAdding(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-white">
        <Loader2 className="animate-spin w-8 h-8 mr-2" /> Loading...
      </div>
    );

  if (!manga)
    return (
      <div className="flex items-center justify-center py-20 text-white">
        Manga not found.
      </div>
    );

  return (
    <div className="text-white max-w-5xl mx-auto">
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

        </div>
      </div>
    </div>
  );
}
