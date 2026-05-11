import { ProfileTabs } from "@/app/(dashboard)/dashboard/components/ProfileTabs";

// Settings lives at /settings (sibling of /dashboard in the (dashboard) group),
// so it doesn't inherit dashboard/layout.tsx. Adding ProfileTabs here means the
// tab bar appears consistently whether you're on /dashboard or /settings.
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProfileTabs />
      {children}
    </>
  );
}
