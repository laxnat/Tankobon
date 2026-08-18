"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { ReadingStreakCard, type ActivityData } from "./components/ReadingStreakCard";
import { CurrentlyReadingCard, type ReadingEntry } from "./components/CurrentlyReadingCard";
import { StatisticsCard, type Stats } from "./components/StatisticsCard";
import { GenresChartCard } from "./components/GenresChartCard";
import { RecentlyUpdatedCard } from "./components/RecentlyUpdatedCard";
import { FavoritesCard } from "./components/FavoritesCard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [genreData, setGenreData] = useState<{ genre: string; count: number }[]>([]);
  const [readingList, setReadingList] = useState<ReadingEntry[]>([]);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);

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

      if (statsRes.ok) setStats(statsData);
      else console.error("Stats fetch failed:", statsData);

      if (genreRes.ok) setGenreData(genreJson.genres);
      else console.error("Genre fetch failed:", genreJson);

      if (readingRes.ok) setReadingList(readingJson.library);
      else console.error("Reading fetch failed:", readingJson);

      if (activityRes.ok) setActivityData(activityJson);
      else console.error("Activity fetch failed:", activityJson);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
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
    <div className="h-full grid grid-cols-[1.5fr_1fr_1fr] grid-rows-[2fr_4fr_1fr_1fr_1fr] gap-4 min-h-0">
      <ReadingStreakCard activityData={activityData} />
      <CurrentlyReadingCard entries={readingList} />
      <StatisticsCard stats={stats} />
      <GenresChartCard genres={genreData} />
      <RecentlyUpdatedCard />
      <FavoritesCard />
    </div>
  );
}
