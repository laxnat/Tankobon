"use client"

import { ActivityCalendar } from "react-activity-calendar";
import { Flame } from "lucide-react";

interface Activity {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

interface Props {
    activities: Activity[];
}

function withPlaceholder(activities: Activity[]): Activity[] {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayKey = today.toISOString().slice(0, 10);

    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 52 * 7);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    const startKey = start.toISOString().slice(0, 10);

    const inRange = activities.filter((a) => a.date >= startKey && a.date <= todayKey);

    const result = [...inRange];

    if (!result.some((a) => a.date === startKey)) {
        result.unshift({ date: startKey, count: 0, level: 0 });
    }
    if (!result.some((a) => a.date === todayKey )) {
        result.push({ date: todayKey, count: 0, level: 0 });
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
}

export function ReadingStreakCalendar({ activities }: Props) {
    return (
        <div className="overflow-hidden w-full h-full flex font-sans items-start">
          <ActivityCalendar
            data={withPlaceholder(activities)}
            colorScheme="dark"
            weekStart={0}
            theme={{
              dark: ["#1e293b", "#1d4ed8", "#2563eb", "#3b82f6", "#93c5fd"],
            }}
            showWeekdayLabels
            labels={{
              months:
  ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
              weekdays: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
              totalCount: "{{count}} chapters read in the past year",
            }}
            style={{ width: "100%", fontSize: "10px" }}
          />                                                                              
        </div>                            
    );
}