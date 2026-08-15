"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Flame, Clock, Heart, Users } from "lucide-react";
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
    // h-full fills main's content box (main has px-8 py-8 already, no extra padding needed)
    // flex row: scrollable left grid + fixed-width right Social panel
    <div className="flex gap-4 h-full">

      {/* ── Left: 3-column × 3-row grid, fills all available height ── */}
      {/* grid-rows-3 = equal thirds; min-h-0 lets flex shrink below content size */}
      <div className="flex-1 grid grid-cols-3 grid-rows-[1.5fr_1fr_1fr_1fr] gap-4 min-h-0">

        {/* ── Row 1 ── */}
        <Card className="col-span-3 bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle className="font-display text-xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Reading Streak
              </span>
              <div className="flex items-center gap-4 font-sans">
                <div className="flex items-center gap-1.5">
                  <Flame className={`w-4 h-4 ${(activityData?.streak ?? 0) > 0 ?
          "text-orange-400" : "text-white/25"}`} />
                  <span className="text-white text-sm font-semibold">{activityData?.streak
          ?? 0}</span>
                  <span className="text-white/40 text-xs font-normal">day streak</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-sm
          font-semibold">{activityData?.totalChapters ?? 0}</span>
                  <span className="text-white/40 text-xs font-normal">chapters this
          year</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-3">
            {activityData ? (
              <ReadingStreakCalendar
                activities={ activityData.activities }
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-white/25">
                <Flame className="w-8 h-8" />
                <span className="text-sm">No activity yet</span>
              </div>

            )}
          </CardContent>
        </Card>

        {/* ── Row 2 ── */}
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

        <Card className="bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col col-span-2 overflow-hidden">
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle className="font-display text-xl">Genres Chart</CardTitle>
          </CardHeader>
          {/* overflow-hidden clips the fixed-size Recharts canvas if the card is smaller */}
          <CardContent className="flex-1 overflow-hidden flex items-center justify-center p-0">
            <GenreChart genres={genreData} />
          </CardContent>
        </Card>

        <Card className="bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle className="font-display text-xl">Currently Reading</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {readingList.length === 0 ? (
              <p className="text-white/40 text-sm">No manga currently reading.</p>
            ) : (
              <div className="space-y-3">
                {readingList.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3">
                    {entry.imageUrl && (
                      <Image src={entry.imageUrl} alt={entry.title} width={40} height={60} className="rounded object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-sm truncate">{entry.title}</p>
                      <p className="text-white/40 text-xs">{entry.chaptersRead} / {entry.totalChapters ?? "?"} ch</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2 bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
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

        {/* ── Row 3 ── */}
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

      {/* ── Right: Social panel — full height, fixed width ── */}
      {/* flex-shrink-0 prevents it from compressing when the left grid needs space */}
      <Card className="w-64 flex-shrink-0 bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 pb-2">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Social
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-2 text-white/25">
          <Users className="w-8 h-8" />
          <span className="text-sm">Coming soon</span>
        </CardContent>
      </Card>

    </div>
  );
}