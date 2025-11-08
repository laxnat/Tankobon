"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, BookOpen, Star, BarChart3 } from "lucide-react";

interface Stats {
  total: number;
  reading: number;
  completed: number;
  planToRead: number;
  onHold: number;
  dropped: number;
  avgRating: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") fetchStats();
  }, [status]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/library/stats");
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading...
      </div>
    );

  if (!session)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Please sign in to view your profile.
      </div>
    );

  return (
    <div className="min-h-screen pt-24 px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-6">
          {session.user?.name || "User"}'s Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Total */}
          <div className="bg-light-navy/40 rounded-2xl p-6 border border-white/10 shadow-lg text-center">
            <BookOpen className="w-10 h-10 mx-auto text-blue-400 mb-2" />
            <h2 className="text-white text-2xl font-bold">{stats?.total ?? 0}</h2>
            <p className="text-white-purple font-medium">Total Manga</p>
          </div>

          {/* Average Rating */}
          <div className="bg-light-navy/40 rounded-2xl p-6 border border-white/10 shadow-lg text-center">
            <Star className="w-10 h-10 mx-auto text-yellow-400 mb-2" />
            <h2 className="text-white text-2xl font-bold">
              {stats?.avgRating ?? 0}
            </h2>
            <p className="text-white-purple font-medium">Average Rating</p>
          </div>

          {/* Completed */}
          <div className="bg-light-navy/40 rounded-2xl p-6 border border-white/10 shadow-lg text-center">
            <BarChart3 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
            <h2 className="text-white text-2xl font-bold">
              {stats?.completed ?? 0}
            </h2>
            <p className="text-white-purple font-medium">Completed</p>
          </div>
        </div>

        {/* Detailed breakdown */}
        <div className="mt-12 bg-light-navy/30 p-6 rounded-2xl border border-white/5 shadow-lg">
          <h2 className="text-white font-bold text-xl mb-4">Progress Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-white">
            <StatItem label="Reading" value={stats?.reading ?? 0} color="text-green-400" />
            <StatItem label="Plan to Read" value={stats?.planToRead ?? 0} color="text-gray-400" />
            <StatItem label="On Hold" value={stats?.onHold ?? 0} color="text-yellow-400" />
            <StatItem label="Dropped" value={stats?.dropped ?? 0} color="text-red-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 text-center">
      <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
      <p className="text-white-purple">{label}</p>
    </div>
  );
}
