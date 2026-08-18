import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Stats {
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

const TILES: Array<[string, (s: Stats) => string | number]> = [
  ["Total manga",   (s) => s.total],
  ["Avg rating",    (s) => s.avgRating.toFixed(1)],
  ["Chapters read", (s) => s.chaptersRead.toLocaleString()],
  ["Volumes owned", (s) => s.totalOwnedVolumes],
];

const BREAKDOWN: Array<[string, keyof Stats, string]> = [
  ["Reading",      "reading",     "bg-blue-400"],
  ["Completed",    "completed",   "bg-green-400"],
  ["Plan to read", "planToRead",  "bg-reg-blue"],
  ["On hold",      "onHold",      "bg-amber-400"],
  ["Dropped",      "dropped",     "bg-red-400"],
];

export function StatisticsCard({ stats }: { stats: Stats | null }) {
  return (
    <Card className="bg-light-navy/30 hover:bg-light-navy/50 border border-white/5 hover:border-white/10 rounded-2xl ring-0 transition-all duration-300 flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="font-sans text-xs font-semibold tracking-widest uppercase text-white/40">
          Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">

        {/* 2×2 key-number tiles */}
        <dl className="grid grid-cols-2 gap-2">
          {TILES.map(([label, getValue]) => (
            <div key={label} className="rounded-xl bg-white/5 px-3 py-2">
              <dt className="truncate text-[11px] uppercase tracking-wide text-white/40">
                {label}
              </dt>
              <dd className="font-display text-lg tabular-nums text-white">
                {stats ? getValue(stats) : 0}
              </dd>
            </div>
          ))}
        </dl>

        {/* Status breakdown with coloured dots */}
        <div className="space-y-2">
          {BREAKDOWN.map(([label, key, color]) => (
            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
                <span className="truncate text-sm text-white/55">{label}</span>
              </div>
              <span className="text-sm tabular-nums text-white">
                {stats?.[key] ?? 0}
              </span>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}
