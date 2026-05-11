import { SidebarProvider } from "@/components/ui/sidebar";
import ProfileSidebar from "@/app/(dashboard)/dashboard/components/ProfileSidebar";

// Shared shell for all "app" pages — dashboard, search, library, etc.
// Any page under (dashboard)/* gets the sidebar automatically.
// Route groups are URL-transparent: /search stays /search, /dashboard stays /dashboard.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ProfileSidebar />
      {/*
        md:ml-64 offsets the content by the sidebar width (16rem = 256px).
        On mobile the sidebar is a Sheet drawer, so no margin needed there.
      */}
      <main className="flex-1 md:ml-64 px-8 py-8">
        {children}
      </main>
    </SidebarProvider>
  );
}
