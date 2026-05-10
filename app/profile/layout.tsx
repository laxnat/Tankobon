import { SidebarProvider } from "@/components/ui/sidebar";
import ProfileSidebar from "./components/ProfileSidebar";
import { ProfileTabs } from "./components/ProfileTabs";

// This layout file is what makes the sidebar appear on every page under /profile.
// It inherits from the root layout (fonts, Providers) but NOT from app/(main)/layout.tsx
// — route groups mean the Navbar and Footer only appear on (main)/* pages.
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ProfileSidebar />
      {/*
        Why not SidebarInset?
        The shadcn sidebar component ships with Tailwind v4 syntax (w-(--sidebar-width))
        but this project runs Tailwind v3. The gap div that normally reserves space in
        the flex layout collapses to zero width in v3 — so SidebarInset gets full width
        and overlaps the fixed sidebar panel.

        Fix: skip the broken gap mechanism and use an explicit md:ml-64 (= 16rem,
        matching the SIDEBAR_WIDTH constant in sidebar.tsx). On mobile the sidebar
        is a Sheet drawer, so no margin is needed.
      */}
      <main className="flex-1 md:ml-64 px-8 py-8">
        <ProfileTabs />
        {children}
      </main>
    </SidebarProvider>
  );
}
