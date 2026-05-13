"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function DashboardHeader() {
  const { data: session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Same pattern as the sidebar: fire once on mount to load the stored avatar.
  // useEffect([]) = "run after the first render, never again" — right for a one-time fetch.
  useEffect(() => {
    fetch("/api/profile/image")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.image) setAvatarUrl(data.image);
      })
      .catch(() => {});
  }, []);

  return (
    // sticky top-0 keeps the header pinned as the content area scrolls.
    // z-10 sits it above normal content but below modals/sheets (typically z-50+).
    // bg-[#11111a] matches the page body background so content scrolling behind
    // it doesn't bleed through — no backdrop-blur needed on a solid color.
    <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-3 border-b border-white/[0.06] bg-[#11111a]">
      {/* ── Search trigger ── */}
      {/*
        This is a link styled as a search bar, not a real <input>.
        Clicking it navigates to /search where the actual search UI lives.
        This pattern (cmd+K launchers, Spotlight-style bars) is common: the
        trigger is decorative, the real search is a separate page or modal.
      */}
      <Link
        href="/search"
        className="flex items-center gap-2.5 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-white/40 hover:text-white/60 text-sm transition-colors w-72"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span>Search manga…</span>
      </Link>

      {/* ── Profile: name + avatar ── */}
      {/*
        Name before avatar mirrors the reading direction: text → image.
        Linking to /dashboard makes the avatar a shortcut back home.
      */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <span className="text-white/70 text-sm font-medium">
          {session?.user?.name || "User"}
        </span>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
          <img
            src={avatarUrl || "/images/blankpfp.png"}
            alt="Profile"
            className="object-cover w-full h-full"
          />
        </div>
      </Link>
    </header>
  );
}
