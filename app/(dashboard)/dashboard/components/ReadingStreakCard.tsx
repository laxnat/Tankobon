"use client";

import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadingStreakCalendar } from "@/components/ReadingStreakCalendar";

export interface Activity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityData {
  activities: Activity[];
  streak: number;
  totalChapters: number;
}

export function ReadingStreakCard({ activityData }: { activityData: ActivityData | null }) {
  const streak = activityData?.streak ?? 0;

  return (
    <Card className="col-span-2 bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="font-display text-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Flame className={`w-8 h-6 ${streak > 0 ? "text-orange-400" : "text-white/50"}`} />
              <span className="text-white">{streak}</span>
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
  );
}
