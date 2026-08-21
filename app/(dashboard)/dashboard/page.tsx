"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { ReadingStreakCard, type ActivityData } from "./components/ReadingStreakCard";
import { CurrentlyReadingCard, type ReadingEntry } from "./components/CurrentlyReadingCard";
import { StatisticsCard, type Stats } from "./components/StatisticsCard";
import { GenresChartCard } from "./components/GenresChartCard";
import { RecentlyUpdatedCard, type RecentlyUpdatedEntry } from "./components/RecentlyUpdatedCard";
import { FavoritesCard } from "./components/FavoritesCard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [genreData, setGenreData] = useState<{ genre: string; count: number }[]>([]);
  const [readingList, setReadingList] = useState<ReadingEntry[]>([]);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [recentItems, setRecentItems] = useState<RecentlyUpdatedEntry[]>([]);
  const [favorites, setFavorites] = useState<{ id: string; title: string; imageUrl: string | null; malId: number }[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [statsRes, genreRes, readingRes, activityRes, recentRes, favoritesRes] = await Promise.all([
        fetch("/api/library/stats"),
        fetch("/api/profile/stats/genres"),
        fetch("/api/library?status=READING"),
        fetch("/api/activity"),
        fetch("/api/library/recent"),
        fetch("/api/library/favorites"),
      ]);

      const [statsData, genreJson, readingJson, activityJson, recentJson, favoritesJson] = await Promise.all([
        statsRes.json(),
        genreRes.json(),
        readingRes.json(),
        activityRes.json(),
        recentRes.json(),
        favoritesRes.json(),
      ]);

      if (statsRes.ok) setStats(statsData);
      else console.error("Stats fetch failed:", statsData);

      if (genreRes.ok) setGenreData(genreJson.genres);
      else console.error("Genre fetch failed:", genreJson);

      if (readingRes.ok) setReadingList(readingJson.library);
      else console.error("Reading fetch failed:", readingJson);

      if (activityRes.ok) setActivityData(activityJson);
      else console.error("Activity fetch failed:", activityJson);

      if (recentRes.ok) setRecentItems(recentJson.items);
      else console.error("Recent fetch failed:", recentJson);

      if (favoritesRes.ok) setFavorites(favoritesJson.favorites);
      else console.error("Favorites fetch failed:", favoritesJson);
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
    <div className="grid grid-cols-12 gap-4">
      <ReadingStreakCard activityData={activityData} className="col-span-12 md:col-span-9" />
      <CurrentlyReadingCard entries={readingList} className="col-span-12 md:col-span-3" />
      <StatisticsCard stats={stats} className="col-span-12 md:col-span-3 self-start" />
      <GenresChartCard genres={genreData} className="col-span-12 md:col-span-5 self-start" />
      <RecentlyUpdatedCard items={recentItems} className="col-span-12 md:col-span-4" />
      <FavoritesCard favorites={favorites} className="col-span-12 md:col-span-12" />
    </div>
  );
}
