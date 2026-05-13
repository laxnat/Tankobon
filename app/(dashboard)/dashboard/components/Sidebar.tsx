"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Star,
  Settings,
  LogOut,
  BookOpen,
  Compass,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
// Settings/BookOpen/Compass/LayoutDashboard stay imported — they're used in navItems above
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems: { href: string; icon: LucideIcon; label: string }[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/discover",  icon: Compass,         label: "Discover"   },
  { href: "/library",   icon: BookOpen,        label: "Library" },
  { href: "/settings",  icon: Settings,        label: "Settings"   },
];

export default function ProfileSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
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
      className="h-svh w-64 border-r border-white/[0.06]"
      collapsible="none"
    >
      {/* Logo */}
      <SidebarHeader className="p-4 py-8">
        <Link href="/" className="flex items-center gap-2.5 select-none">
          <Image
            src="/tankobon.png"
            alt="Tankōbon"
            width={45}
            height={45}
            className="object-contain"
          />
          <span className="font-display text-white hover:text-reg-blue text-xl leading-none">
            Tankōbon
          </span>
        </Link>
      </SidebarHeader>

      {/*  Nav items */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="pl-2 tracking-wide text-white/55">Overview</SidebarGroupLabel>
          <SidebarGroupContent className="px-0">
            <SidebarMenu>
              {navItems.map(({ href, icon: Icon, label }) => {
                const active = pathname === href;
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      size="lg"
                      isActive={active}
                      className={`pl-4 ${cn("gap-4", active && "bg-sidebar-accent")}`}
                      render={<Link href={href} />}
                    >
                      {/* Icon is reg-blue on the active page, muted otherwise */}
                      <Icon className={active ? "text-reg-blue" : "text-white/55"} />
                      <span className="font-display text-white">{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
          Log Out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
