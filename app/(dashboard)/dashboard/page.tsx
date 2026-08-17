"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Flame, Clock, Heart } from "lucide-react";
import { GenreChart } from "@/components/GenreChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { ReadingStreakCalendar } from "@/components/ReadingStreakCalendar";

interface Stats {
  total: number;
  reading: number;
  completed: number;
  planToRead: number;
  onHold: number;
  dropped: number;
  avgRating: number;
  chaptersRead: number;
  volumesRead: number;
  totalOwnedVolumes: number;
}

interface ReadingEntry {
  id: string;
  malId: number;
  title: string;
  imageUrl: string | null;
  chaptersRead: number;
  totalChapters: number | null;
}

interface Activity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [genreData, setGenreData] = useState<{ genre: string; count: number }[]>([]);
  const [readingList, setReadingList] = useState<ReadingEntry[]>([]);
  const [activityData, setActivityData] = useState<{
    activities: Activity[];
    streak: number;
    totalChapters: number;
  } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cycle to the next manga every 4 seconds.
  // Functional update avoids reading stale `currentIndex` from the closure —
  // React hands `prev` the real current value from its internal store each tick.
  useEffect(() => {
    if (readingList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % readingList.length);
    }, 4000);
    return () => clearInterval(interval); // runs on unmount or when list length changes
  }, [readingList.length]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [statsRes, genreRes, readingRes, activityRes] = await Promise.all([
        fetch("/api/library/stats"),
        fetch("/api/profile/stats/genres"),
        fetch("/api/library?status=READING"),
        fetch("/api/activity"),
      ]);

      const [statsData, genreJson, readingJson, activityJson] = await Promise.all([
        statsRes.json(),
        genreRes.json(),
        readingRes.json(),
        activityRes.json(),
      ]);

      if (statsRes.ok) {
        setStats(statsData);
      } else {
        console.error("Stats fetch failed:", statsData);
      }
      if (genreRes.ok) {
        setGenreData(genreJson.genres);
      } else {
        console.error("Genre fetch failed:", genreJson);
      }
      if (readingRes.ok) {
        setReadingList(readingJson.library)
      } else {
        console.error("Reading stats fetch failed:", readingJson);
      }
      if (activityRes.ok) {
        setActivityData(activityJson);
      } else {
        console.error("Activity fetch failed", activityJson);
      }
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-white">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading...
      </div>
    );

  if (!session)
    return (
      <div className="flex items-center justify-center py-20 text-white">
        Please sign in to view your profile.
      </div>
    );

  return (
    // Single 3-col grid — no right panel
    <div className="h-full grid grid-cols-[1.5fr_1fr_1fr] grid-rows-[2fr_1fr_1fr_1fr_1fr] gap-4 min-h-0">

      {/* ── Row 1: Reading Streak (2 cols) ── */}
      <Card className="col-span-2 bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="font-display text-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Flame className={`w-8 h-6 ${(activityData?.streak ?? 0) > 0 ? "text-orange-400" : "text-white/50"}`} />
                <span className="text-white">{activityData?.streak ?? 0}</span>
                <span className="text-white">day streak</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white">{activityData?.totalChapters ?? 0}</span>
                <span className="text-white">chapter(s) this year</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-3">
          {activityData ? (
            <ReadingStreakCalendar activities={activityData.activities} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-white/25">
              <Flame className="w-8 h-8" />
              <span className="text-sm">No activity yet</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Row 1: Currently Reading (1 col, right of streak) ── */}
      <Card className="bg-light-navy/30 border border-white/5 rounded-2xl ring-0 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 px-4 py-3">
          <CardTitle className="font-sans text-xs font-semibold tracking-widest uppercase text-white/40">
            Currently Reading
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col min-h-0 overflow-y-auto">
          {readingList.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-4">
              <p className="text-white/40 text-sm text-center">No manga currently reading.</p>
            </div>
          ) : (() => {
            const entry = readingList[currentIndex];
            const progress = entry.totalChapters
              ? Math.round((entry.chaptersRead / entry.totalChapters) * 100)
              : null;
            return (
              <>
                {/* Cover left, info right */}
                <div className="flex-1 flex items-center gap-3 px-4 py-3">
                  {/* Cover */}
                  <div className="flex-shrink-0">
                    {entry.imageUrl ? (
                      <Image
                        src={entry.imageUrl}
                        alt={entry.title}
                        width={56}
                        height={80}
                        className="rounded-lg object-contain shadow-lg shadow-black/40"
                      />
                    ) : (
                      <div className="w-[56px] h-[80px] rounded-lg bg-white/5" />
                    )}
                  </div>

                  {/* Title + chapter progress */}
                  <div className="min-w-0 flex flex-col gap-2">
                    <p className="text-white text-sm font-semibold leading-snug line-clamp-3">
                      {entry.title}
                    </p>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-white text-3xl font-bold leading-none tabular-nums">
                        {entry.chaptersRead}
                      </span>
                      <span className="text-white/40 text-xs">
                        / {entry.totalChapters ?? "?"} ch
                      </span>
                    </div>

                    {progress !== null && (
                      <>
                        <div className="h-px rounded-full bg-white/15 overflow-hidden">
                          <div
                            className="h-full bg-white/70 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-white/40 text-xs tabular-nums">{progress}%</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Pill-dot carousel */}
                {readingList.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 py-3">
                    {readingList.map((item, i) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentIndex(i)}
                        aria-label={`View ${item.title}`}
                        className={`rounded-full transition-all duration-300 ${
                          i === currentIndex
                            ? "w-5 h-1.5 bg-white"
                            : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </CardContent>
      </Card>

      {/* ── Row 2: Statistics (1 col) + Genres Chart (2 cols) ── */}
      <Card className="bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 pb-2">
          <CardTitle className="font-display text-xl">Statistics</CardTitle>
        </CardHeader>
        {/* overflow-y-auto so stats scroll inside the card if the row is short */}
        <CardContent className="flex-1 overflow-y-auto pl-6">
          <div className="flex justify-between"><p className="text-white text-sm">Total Manga</p><p className="text-white text-sm">{stats?.total ?? 0}</p></div>
          <div className="flex justify-between"><p className="text-white text-sm">Average Rating</p><p className="text-white text-sm">{stats?.avgRating ?? 0}</p></div>
          <div className="flex justify-between"><p className="text-white text-sm">Completed</p><p className="text-white text-sm">{stats?.completed ?? 0}</p></div>
          <div className="flex justify-between"><p className="text-white text-sm">Chapters Read</p><p className="text-white text-sm">{stats?.chaptersRead ?? 0}</p></div>
          <div className="flex justify-between"><p className="text-white text-sm">Reading</p><p className="text-white text-sm">{stats?.reading ?? 0}</p></div>
          <div className="flex justify-between"><p className="text-white text-sm">Plan To Read</p><p className="text-white text-sm">{stats?.planToRead ?? 0}</p></div>
          <div className="flex justify-between"><p className="text-white text-sm">On Hold</p><p className="text-white text-sm">{stats?.onHold ?? 0}</p></div>
          <div className="flex justify-between"><p className="text-white text-sm">Dropped</p><p className="text-white text-sm">{stats?.dropped ?? 0}</p></div>
        </CardContent>
      </Card>

      <Card className="col-span-2 bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 pb-2">
          <CardTitle className="font-display text-xl">Genres Chart</CardTitle>
        </CardHeader>
        {/* overflow-hidden clips the fixed-size Recharts canvas if the card is smaller */}
        <CardContent className="flex-1 overflow-hidden flex items-center justify-center p-0">
          <GenreChart genres={genreData} />
        </CardContent>
      </Card>

      {/* ── Row 3: Recently Updated (full width) ── */}
      <Card className="col-span-3 bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 pb-2">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Recently Updated
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-2 text-white/25">
          <Clock className="w-7 h-7" />
          <span className="text-sm">Coming soon</span>
        </CardContent>
      </Card>

      {/* ── Row 4: Favorites (full width) ── */}
      <Card className="col-span-3 bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 pb-2">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            Favorites
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-2 text-white/25">
          <Heart className="w-8 h-8" />
          <span className="text-sm">Coming soon</span>
        </CardContent>
      </Card>

    </div>
  );
}