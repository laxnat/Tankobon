import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/app/(dashboard)/dashboard/components/Sidebar";
import DashboardHeader from "@/app/(dashboard)/dashboard/components/DashboardHeader";

// Shared shell for all "app" pages — dashboard, search, library, etc.
// Any page under (dashboard)/* gets the sidebar + header automatically.
// Route groups are URL-transparent: /search stays /search, /dashboard stays /dashboard.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar />
      {/*
        md:ml-64 offsets the content column by the sidebar width (16rem = 256px).
        flex-col stacks the sticky header on top of the scrollable content area.
        min-h-svh ensures the column fills the full viewport height.
      */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-svh">
        <DashboardHeader />
        <main className="flex-1 px-8 py-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
