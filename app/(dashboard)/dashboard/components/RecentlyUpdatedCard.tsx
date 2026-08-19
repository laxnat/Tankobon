import Image from "next/image";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RecentlyUpdatedEntry {
  id: string;
  title: string;
  imageUrl: string | null;
  change: string; // e.g. "Ch. 12 read"
  at: string;     // e.g. "2d ago"
}

export function RecentlyUpdatedCard({ items, className }: { items: RecentlyUpdatedEntry[]; className?: string }) {
  return (
    <Card className={`bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden ${className ?? ""}`}>
      <CardHeader className="flex-shrink-0 px-4 py-3">
        <CardTitle className="font-sans text-xs font-semibold tracking-widest uppercase text-white/40 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Recently Updated
        </CardTitle>
      </CardHeader>

      {items.length === 0 ? (
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-2 text-white/25 pb-6">
          <Clock className="w-7 h-7" />
          <span className="text-sm">No updates in the last 30 days.</span>
        </CardContent>
      ) : (
        <ul className="scroll-slim flex-1 divide-y divide-white/5 overflow-y-auto">
          {items.map(({ id, title, imageUrl, change, at }) => (
            <li
              key={id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5"
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`${title} cover`}
                  width={36}
                  height={48}
                  className="h-12 w-9 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="h-12 w-9 shrink-0 rounded-md bg-white/5" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{title}</p>
                <p className="truncate text-xs text-white/40">{change}</p>
              </div>
              <span className="shrink-0 text-xs text-white/40">{at}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
