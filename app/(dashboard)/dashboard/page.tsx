"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, BookOpen, Star, BarChart3, Car } from "lucide-react";
import { GenreChart } from "@/components/GenreChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [genreData, setGenreData] = useState<{ genre: string; count: number }[]>([]);
  const [readingList, setReadingList] = useState<ReadingEntry[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [statsRes, genreRes, readingRes] = await Promise.all([
        fetch("/api/library/stats"),
        fetch("/api/profile/stats/genres"),
        fetch("/api/library?status=READING"),
      ]);

      const [statsData, genreJson, readingJson] = await Promise.all([
        statsRes.json(),
        genreRes.json(),
        readingRes.json(),
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
      <div className="max-w-7xl grid grid-cols-4 gap-8">
        {/* Statistics Card*/}
        <Card className="col-span-1 max-w-xs max-h-xl bg-light-navy ring-0 border border-white/10 hover:border-white/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="pl-10">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                {/* <BookOpen className="w-6 h-6 text-blue-400" /> */}
                <p className="text-white text-md">Total Manga:</p>
              </div>
              <p className="text-white text-md justify-end ">{stats?.total ?? 0}</p>
            </div>

            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                {/* <Star className="w-6 h-6 text-yellow-400" /> */}
                <p className="text-white text-md">Average Rating:</p>
              </div>
              <p className="text-white text-md">{stats?.avgRating ?? 0}</p>
            </div>

            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                {/* <BarChart3 className="w-6 h-6 text-emerald-400" /> */}
                <p className="text-white text-md ">Completed:</p>
              </div>
              <p className="text-white text-md ">{stats?.completed ?? 0}</p>
            </div>

            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                {/* <BookOpen className="w-6 h-6 text-purple-400" /> */}
                <p className="text-white text-md ">Chapters Read:</p>
              </div>
              <p className="text-white text-md ">{stats?.chaptersRead ?? 0}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-white text-md">Reading:</p>
              <p className="text-white text-md">{stats?.reading ?? 0}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-white text-md">Plan To Read:</p>
              <p className="text-white text-md">{stats?.planToRead ?? 0}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-white text-md">On Hold:</p>
              <p className="text-white text-md">{stats?.onHold ?? 0}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-white text-md">Dropped:</p>
              <p className="text-white text-md">{stats?.dropped ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Genres Chart */}
        <Card className="col-span-2 max-w-fit max-h-xl bg-light-navy ring-0 border border-white/10 hover:border-white/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Genres Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <GenreChart genres={genreData} />
          </CardContent>
        </Card>

        {/* Reading Streak Card */}

        {/* Currently Reading Carousel Card */}
        <Card className="col-span-1 max-w-xs max-h-xl bg-light-navy ring-0 border border-white/10 hover:border-white/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Currently Reading</CardTitle>
          </CardHeader>
          <CardContent>
            {readingList.length === 0 ? (
              <p>No Manga Currently Reading</p>
            ) : (
              <div>
              {readingList.map((entry) => (
                <div key={(entry.id)}>
                  {entry.title}
                  {entry.imageUrl && (
                    <Image src={entry.imageUrl} alt={entry.title} width={80} height={120} />
                  )}
                  {entry.chaptersRead} / {entry.totalChapters ?? "?"} chapters
                </div>
              ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Updated Strip Card */}

        {/* Favorites Card */}

        {/* Profile Card */}
        <Card className="col-span-1 row-span-2 max-w-fit max-h-fit bg-light-navy ring-0 border border-white/10 hover:border-white/50">
          <CardHeader>
            <CardTitle>Social</CardTitle>
            
          </CardHeader>
        </Card>
      </div>
    </div>
    
  );
}