"use client";

interface GenreEntry {
  genre: string;
  count: number;
}

const COLORS = [
  "#60a5fa", // blue-400
  "#34d399", // emerald-400
  "#a78bfa", // violet-400
  "#f87171", // red-400
  "#facc15", // yellow-400
  "#fb923c", // orange-400
  "#e879f9", // fuchsia-400
  "#2dd4bf", // teal-400
  "#f472b6", // pink-400
  "#a3e635", // lime-400
];

export function GenreChart({ genres }: { genres: GenreEntry[] }) {
  const TOP_N = 9;
  const top = genres.slice(0, TOP_N);
  const rest = genres.slice(TOP_N);
  const otherCount = rest.reduce((sum, g) => sum + g.count, 0);

  const data = [
    ...top.map((g) => ({ name: g.genre, value: g.count })),
    ...(otherCount > 0 ? [{ name: "Other", value: otherCount }] : []),
  ];

  if (data.length === 0) {
    return (
      <p className="text-white/40 text-center text-sm py-8">
        Add manga to see your genre breakdown.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="w-full flex flex-col gap-2 px-4 py-2">
      {data.map((entry, i) => {
        const pct = (entry.value / max) * 100;
        const color = i < TOP_N ? COLORS[i % COLORS.length] : "#475569";
        return (
          <div key={entry.name} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3">
            {/* Label */}
            <span className="truncate text-sm text-white/60 text-right">{entry.name}</span>

            {/* Bar track */}
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>

            {/* Count */}
            <span className="text-sm tabular-nums text-white/40 text-right">{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}
