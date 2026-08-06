"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Settings,
  LogOut,
  BookOpen,
  Compass,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
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
  const pathname = usePathname();

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
          <SidebarGroupLabel className="pl-2 text-sm tracking-tight text-white/55">Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
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

      {/* ── Footer: sign out ── */}
      <SidebarFooter className="p-4 gap-2">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-600/80 text-white/70 hover:text-white text-sm rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
