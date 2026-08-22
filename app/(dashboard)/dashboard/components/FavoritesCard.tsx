import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FavoriteEntry {
  id: string;
  title: string;
  imageUrl: string | null;
  malId: number;
}

interface Props {
  favorites: FavoriteEntry[];
  className?: string;
}

export function FavoritesCard({ favorites, className }: Props) {
  return (
    <Card className={`bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden ${className ?? ""}`}>
      <CardHeader className="flex-shrink-0 px-4">
        <CardTitle className="font-sans text-xs tracking-widest uppercase text-white flex items-center gap-2">
          Favorites
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 px-4">
        {favorites.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-white/25 py-6">
            <Heart className="w-7 h-7" />
            <span className="text-sm">No favorites yet.</span>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-3">
            {favorites.map((entry) => (
              <Link key={entry.id} href={`/manga/${entry.malId}`} title={entry.title}>
                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-colors">
                  {entry.imageUrl ? (
                    <Image
                      src={entry.imageUrl}
                      alt={entry.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <span className="text-white/20 text-[10px] text-center px-1 leading-tight">{entry.title}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
