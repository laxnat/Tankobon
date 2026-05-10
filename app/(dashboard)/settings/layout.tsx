import { ProfileTabs } from "@/app/(dashboard)/profile/components/ProfileTabs";

// Settings lives at /settings (sibling of /profile in the (dashboard) group),
// so it doesn't inherit profile/layout.tsx. Adding ProfileTabs here means the
// tab bar appears consistently whether you're on /profile or /settings.
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
