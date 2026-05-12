"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Upload,
  Star,
  Settings,
  LogOut,
  BookOpen,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Square → centered square crop → JPEG at given quality.
// Running this in-browser avoids sending a multi-MB raw image to the server.
function compressImage(file: File, size = 256, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ProfileSidebar() {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Fetch the stored profile image once the session is confirmed.
  // useEffect with [] runs once after first render — the right tool for
  // "fire a side effect on mount." useState's initializer only computes
  // an initial value; it can't trigger async work.
  useEffect(() => {
    fetch("/api/profile/image")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.image) setPreviewUrl(data.image);
      })
      .catch(() => {});
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      setPreviewUrl(compressed);
      const res = await fetch("/api/profile/update-pfp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressed }),
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Profile picture updated!");
    } catch {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpgrade = async () => {
    setLoadingCheckout(true);
    const toastId = toast.loading("Opening checkout…");
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        toast.dismiss(toastId);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch {
      toast.error("Couldn't start checkout. Please try again.", {
        id: toastId,
      });
      setLoadingCheckout(false);
    }
  };

  return (
    /*
      Now that the Navbar is gone (moved to the (main) route group layout),
      the sidebar starts from the very top of the viewport.
      h-svh = 100svh — svh uses the small viewport height on mobile, which
      excludes browser chrome (address bar). Better than 100vh on mobile Safari.
    */
    <Sidebar
      className="top-0 h-svh w-64 border-r border-white/[0.06]"
      collapsible="offcanvas"
    >
      {/* ── Logo: links back to the public site ── */}
      <SidebarHeader className="p-4 pb-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-1 py-2 rounded-lg hover:bg-white/[0.05] transition-colors duration-150 select-none"
        >
          <Image
            src="/tankobon.png"
            alt="Tankōbon"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="font-display text-white text-[1.0625rem] tracking-[-0.015em] leading-none">
            Tankōbon
          </span>
        </Link>
      </SidebarHeader>

      {/* ── Header: avatar + identity ── */}
      <SidebarHeader className="p-5 pt-4 gap-4">
        {/* Avatar with upload overlay */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
              <img
                src={previewUrl || "/images/blankpfp.png"}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </div>
            <label
              htmlFor="sidebar-profile-upload"
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-1.5 rounded-full cursor-pointer shadow-md transition"
              title="Change profile picture"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-white" />
              )}
              <input
                id="sidebar-profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Name + email */}
        <div className="text-center">
          <p className="text-white font-semibold text-base leading-tight">
            {session?.user?.name || "User"}
          </p>
          <p className="text-white/50 text-xs mt-0.5 truncate">
            {session?.user?.email}
          </p>

          {/* Premium badge — only shown when user is premium */}
          {session?.user?.isPremium && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-semibold rounded-full">
              <Star className="w-3 h-3 fill-yellow-400" />
              Premium
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* ── Nav items ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {/*
                  render prop (base-nova style) is how you swap the default <button>
                  for a custom element like Link. Equivalent to Radix's `asChild`.
                */}
                <SidebarMenuButton
                  size="lg"
                  render={<Link href="/search" />}
                >
                  <Search className="text-white/60" />
                  <span>Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  render={<Link href="/library" />}
                >
                  <BookOpen className="text-blue-400" />
                  <span>My Library</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  isActive
                  render={<Link href="/dashboard" />}
                >
                  <span className="text-lg">👤</span>
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  render={<Link href="/settings" />}
                >
                  <Settings className="text-white/60" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: upgrade + sign out ── */}
      <SidebarFooter className="p-4 gap-2">
        {/* Go Premium — hidden if user already has premium */}
        {!session?.user?.isPremium && (
          <button
            onClick={handleUpgrade}
            disabled={loadingCheckout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold rounded-xl shadow-md shadow-yellow-500/20 transition disabled:opacity-60"
          >
            {loadingCheckout ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Star className="w-4 h-4" />
            )}
            Go Premium
          </button>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-600/80 text-white/70 hover:text-white text-sm font-medium rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
