"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenreChart } from "@/components/GenreChart";

export function GenresChartCard({ genres }: { genres: { genre: string; count: number }[] }) {
  return (
    <Card className="col-span-2 bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="font-display text-xl">Genres Chart</CardTitle>
      </CardHeader>
      {/* overflow-hidden clips the fixed-size Recharts canvas if the card is smaller */}
      <CardContent className="flex-1 overflow-hidden flex items-center justify-center p-0">
        <GenreChart genres={genres} />
      </CardContent>
    </Card>
  );
}
