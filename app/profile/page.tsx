"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Loader2, BookOpen, Star, BarChart3, Upload, LogOut } from "lucide-react";

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
  const { data: session, status, update } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats();
      setPreviewUrl(session?.user?.image || null);
    }
  }, [status, session]);

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

  const triggerPopup = (message: string) => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2500); // auto-hide after 2.5s
  };

  // Simulated upload handler — you can replace this later with Firebase Storage, S3, or another upload API.
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setUploading(true);
  
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);
  
        const res = await fetch("/api/profile/update-pfp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
  
        if (!res.ok) throw new Error("Failed to update profile image");
  
        await update(); // Refresh session
        triggerPopup("Profile picture updated!");
      };
  
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed to upload image:", err);
      triggerPopup("Upload failed. Try again.");
    } finally {
      setUploading(false);
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
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          {/* Profile info */}
          <div className="flex items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/40 shadow-lg">
                <img
                  src={previewUrl || "public/images/blankpfp.png"}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Upload Button */}
              <label
                htmlFor="profile-upload"
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full cursor-pointer shadow-lg transition"
                title="Change Profile Picture"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-white" />
                )}
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {session.user?.name || "User"}
              </h1>
              <p className="text-white-purple">{session.user?.email}</p>
            </div>
          </div>

          {/* Sign out button */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md shadow-red-600/30 transition"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total */}
          <div className="bg-light-navy/40 rounded-2xl p-6 border border-white/5 shadow-lg flex justify-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h2 className="text-white-purple text-lg font-bold">{stats?.total ?? 0}</h2>
            <p className="text-white-purple text-lg font-bold">Total Manga</p>
          </div>

          {/* Average Rating */}
          <div className="bg-light-navy/40 rounded-2xl p-6 border border-white/5 shadow-lg flex justify-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-white-purple text-lg font-bold">
              {stats?.avgRating ?? 0}
            </h2>
            <p className="text-white-purple text-lg font-bold">Average Rating</p>
          </div>

          {/* Completed */}
          <div className="bg-light-navy/40 rounded-2xl p-6 border border-white/5 shadow-lg flex justify-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <h2 className="text-white-purple text-lg font-bold">
              {stats?.completed ?? 0}
            </h2>
            <p className="text-white-purple text-lg font-bold">Completed</p>
          </div>
        </div>

        {/* Detailed breakdown */}
        <div className="mt-6 bg-light-navy/30 p-6 rounded-2xl border border-white/5 shadow-lg">
          <h2 className="text-white font-bold text-xl mb-4">Progress Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
            <StatItem label="Reading" value={stats?.reading ?? 0} color="text-green-400" />
            <StatItem label="Plan to Read" value={stats?.planToRead ?? 0} color="text-blue-400" />
            <StatItem label="On Hold" value={stats?.onHold ?? 0} color="text-yellow-400" />
            <StatItem label="Dropped" value={stats?.dropped ?? 0} color="text-red-400" />
          </div>
        </div>
      </div>
        {/* Success Popup */}
        {showPopup && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-400 to-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 animate-fadeIn z-50">
            Profile picture updated!
        </div>
        )}
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
