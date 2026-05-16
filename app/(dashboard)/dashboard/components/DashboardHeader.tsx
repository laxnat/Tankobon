"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Maps URL segments to the display labels shown in breadcrumbs.
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  discover:  "Discover",
  library:   "Library",
  settings:  "Settings",
};

function Breadcrumbs() {
  const pathname = usePathname();
  const rawSegments = pathname.split("/").filter(Boolean);

  // Walk segments manually so we can consume "manga" + "[id]" as one crumb.
  const crumbs: Array<{ label: string; href: string }> = [];
  let i = 0;
  while (i < rawSegments.length) {
    const seg = rawSegments[i];
    const next = rawSegments[i + 1];

    if (seg === "manga" && next !== undefined) {
      // Collapse "manga" + id into a single entry: "manga/123"
      crumbs.push({
        label: `Manga/[${next}]`,
        href: "/" + rawSegments.slice(0, i + 2).join("/"),
      });
      i += 2;
    } else {
      crumbs.push({
        label: SEGMENT_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
        href: "/" + rawSegments.slice(0, i + 1).join("/"),
      });
      i += 1;
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {/* Separator */}
            {i > 0 && <span className="text-white/20">/</span>}

            {/* Last segment */}
            {isLast ? (
              <span className="text-white font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function DashboardHeader() {
  const { data: session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile/image")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.image) setAvatarUrl(data.image);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-8">
      <Breadcrumbs />

      {/* ── Profile: avatar + name ── */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
          <img
            src={avatarUrl || "/images/blankpfp.png"}
            alt="Profile"
            className="object-cover w-full h-full"
          />
        </div>
        <span className="text-white/70 text-sm font-medium">
          {session?.user?.name || "User"}
        </span>
      </Link>
    </header>
  );
}
