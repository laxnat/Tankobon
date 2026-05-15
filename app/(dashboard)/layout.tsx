import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/app/(dashboard)/dashboard/components/Sidebar";
import DashboardHeader from "@/app/(dashboard)/dashboard/components/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto overscroll-none px-8 py-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
