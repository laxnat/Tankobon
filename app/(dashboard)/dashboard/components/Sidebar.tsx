"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Star,
  Settings,
  LogOut,
  BookOpen,
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

export default function ProfileSidebar() {
  const { data: session } = useSession();
  const [loadingCheckout, setLoadingCheckout] = useState(false);

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
    <Sidebar
      className="top-0 h-svh w-64 border-r border-white/[0.06]"
      collapsible="offcanvas"
    >
      {/* Logo */}
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

      {/*  Nav items */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
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
