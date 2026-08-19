"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ReadingEntry {
  id: string;
  malId: number;
  title: string;
  author: string | null;
  imageUrl: string | null;
  chaptersRead: number;
  totalChapters: number | null;
}

export function CurrentlyReadingCard({ entries, className }: { entries: ReadingEntry[]; className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance the carousel. Functional update avoids a stale closure on
  // currentIndex — React provides the real current value as `prev`.
  useEffect(() => {
    if (entries.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % entries.length);
    }, 4000);
    return () => clearInterval(id);
  }, [entries.length]);

  const entry = entries[currentIndex];
  const progress =
    entry?.totalChapters
      ? Math.round((entry.chaptersRead / entry.totalChapters) * 100)
      : null;

  return (
    <Card className={`min-h-44 md:min-h-52 bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 flex flex-col overflow-hidden ${className ?? ""}`}>
      <CardHeader className="flex-shrink-0 px-4 py-3">
        <CardTitle className="font-sans text-xs tracking-widest uppercase text-white">
          Currently Reading
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 md:pr-10 lg:pr-16 flex flex-col min-h-0 overflow-y-auto">
        {!entry ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-white/40">
            <BookOpen className="h-7 w-7" />
            <p className="text-sm">Nothing in progress yet.</p>
          </div>
        ) : (
          <>
            {/* Cover left, info right */}
            <div className="flex flex-1 items-center gap-4 px-4 pb-2">
              {entry.imageUrl ? (
                <Image
                  src={entry.imageUrl}
                  alt={entry.title}
                  width={80}
                  height={112}
                  className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="h-28 w-20 shrink-0 rounded-xl bg-white/5" />
              )}

              <div className="flex flex-1 min-w-0 flex-col gap-2">
                <div className="w-full min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{entry.title}</p>
                  {entry.author && (
                    <p className="truncate text-xs text-white/40">{entry.author}</p>
                  )}
                </div>

                <div className="w-full flex items-baseline gap-1.5">
                  <span className="font-display text-3xl leading-none tabular-nums text-white">
                    {entry.chaptersRead}
                  </span>
                  <span className="text-xs text-white/40">
                    / {entry.totalChapters ?? "?"} ch
                  </span>
                </div>

                <div className="w-full flex items-center gap-2">
                  <div className="h-1 w-28 overflow-hidden rounded-full bg-white/15">
                    <div
                      className={`h-full rounded-full bg-white/70 ${
                        progress === null ? "w-full animate-pulse opacity-40" : ""
                      }`}
                      style={progress !== null ? { width: `${progress}%` } : undefined}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs tabular-nums text-white/40">
                    {progress !== null ? `${progress}%` : "?%"}
                  </span>
                </div>
              </div>
            </div>

            {/* Pill-dot carousel nav */}
            {entries.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pb-4">
                {entries.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(i)}
                    aria-label={`View ${item.title}`}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? "h-1.5 w-5 bg-white"
                        : "h-1.5 w-1.5 bg-white/25 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
