"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, BookOpen, Star, BarChart3, Car } from "lucide-react";
import { GenreChart } from "@/app/components/GenreChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [genreData, setGenreData] = useState<{ genre: string; count: number }[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [statsRes, genreRes] = await Promise.all([
        fetch("/api/library/stats"),
        fetch("/api/profile/stats/genres"),
      ]);

      const [statsData, genreJson] = await Promise.all([
        statsRes.json(),
        genreRes.json(),
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
    <div className="px-8">
      <div className="max-w-7xl">
        {/* Statistics Card*/}
        <Card className="max-w-xs bg-light-navy ring-0 border border-white/10">
          <CardHeader>
            <CardTitle className="font-display text-xl">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="pl-10">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <p className="text-white text-md">Total Manga:</p>
              </div>
              <p className="text-white text-md justify-end ">{stats?.total ?? 0}</p>
            </div>

            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                <p className="text-white text-md">Average Rating:</p>
              </div>
              <p className="text-white text-md">{stats?.avgRating ?? 0}</p>
            </div>

            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
                <p className="text-white text-md ">Completed:</p>
              </div>
              <p className="text-white text-md ">{stats?.completed ?? 0}</p>
            </div>

            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-400" />
                <p className="text-white text-md ">Chapters Read:</p>
              </div>
              <p className="text-white text-md ">{stats?.chaptersRead ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        

        {/* Progress Overview */}
        <div className="mt-6 bg-light-navy/30 p-6 rounded-2xl border border-white/5 shadow-lg">
          <h2 className="text-white  text-lg mb-4">Progress Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
            <StatItem label="Reading" value={stats?.reading ?? 0} color="text-green-400" />
            <StatItem label="Plan to Read" value={stats?.planToRead ?? 0} color="text-blue-400" />
            <StatItem label="On Hold" value={stats?.onHold ?? 0} color="text-yellow-400" />
            <StatItem label="Dropped" value={stats?.dropped ?? 0} color="text-red-400" />
          </div>
        </div>

        {/* Genre Breakdown */}
        <div className="mt-6 bg-light-navy/30 p-6 rounded-2xl border border-white/5 shadow-lg">
          <h2 className="text-white  text-lg mb-4">Genre Breakdown</h2>
          <GenreChart genres={genreData} />
        </div>
      </div>
    </div>
    
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white-purple/5 border border-white/5 rounded-xl p-4 flex justify-center gap-2">
      <h3 className={`text-lg  ${color}`}>{value}</h3>
      <p className="text-lg text-white-purple ">{label}</p>
    </div>
  );
}
