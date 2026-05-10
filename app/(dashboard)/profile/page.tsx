"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, BookOpen, Star, BarChart3 } from "lucide-react";
import { GenreChart } from "@/app/components/GenreChart";

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

export default function ProfilePage() {
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
    <div className="max-w-3xl">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-light-navy/40 rounded-2xl p-6 border border-white/5 shadow-lg flex justify-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h2 className="text-white-purple text-lg font-bold">{stats?.total ?? 0}</h2>
          <p className="text-white-purple text-lg font-bold">Total Manga</p>
        </div>

        <div className="bg-light-navy/40 rounded-2xl p-6 border border-white/5 shadow-lg flex justify-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" />
          <h2 className="text-white-purple text-lg font-bold">
            {stats?.avgRating ?? 0}
          </h2>
          <p className="text-white-purple text-lg font-bold">Average Rating</p>
        </div>

        <div className="bg-light-navy/40 rounded-2xl p-6 border border-white/5 shadow-lg flex justify-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <h2 className="text-white-purple text-lg font-bold">
            {stats?.completed ?? 0}
          </h2>
          <p className="text-white-purple text-lg font-bold">Completed</p>
        </div>

        <div className="bg-light-navy/40 rounded-2xl p-6 border border-white/5 shadow-lg flex justify-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <h2 className="text-white-purple text-lg font-bold">{stats?.chaptersRead ?? 0}</h2>
          <p className="text-white-purple text-lg font-bold">Chapters Read</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mt-6 bg-light-navy/30 p-6 rounded-2xl border border-white/5 shadow-lg">
        <h2 className="text-white font-bold text-xl mb-4">Progress Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
          <StatItem label="Reading" value={stats?.reading ?? 0} color="text-green-400" />
          <StatItem label="Plan to Read" value={stats?.planToRead ?? 0} color="text-blue-400" />
          <StatItem label="On Hold" value={stats?.onHold ?? 0} color="text-yellow-400" />
          <StatItem label="Dropped" value={stats?.dropped ?? 0} color="text-red-400" />
        </div>
      </div>

      {/* Genre Breakdown */}
      <div className="mt-6 bg-light-navy/30 p-6 rounded-2xl border border-white/5 shadow-lg">
        <h2 className="text-white font-bold text-xl mb-4">Genre Breakdown</h2>
        <GenreChart genres={genreData} />
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
      <h3 className={`text-xl font-bold ${color}`}>{value}</h3>
      <p className="text-xl text-white-purple font-bold">{label}</p>
    </div>
  );
}
