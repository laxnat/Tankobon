import { Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FavoritesCard() {
  return (
    <Card className="col-span-3 bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-400" />
          Favorites
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center gap-2 text-white/25">
        <Heart className="w-8 h-8" />
        <span className="text-sm">Coming soon</span>
      </CardContent>
    </Card>
  );
}
