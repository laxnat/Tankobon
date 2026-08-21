"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenreChart } from "@/components/GenreChart";

export function GenresChartCard({ genres, className }: { genres: { genre: string; count: number }[]; className?: string }) {
  return (
    <Card className={`bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden ${className ?? ""}`}>
      <CardHeader className="flex-shrink-0 px-4 pt-1 pb-0">
        <CardTitle className="font-sans text-xs tracking-widest uppercase text-white">
          Genres
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <GenreChart genres={genres} />
      </CardContent>
    </Card>
  );
}
