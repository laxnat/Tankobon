import { ProfileTabs } from "./components/ProfileTabs";

// Profile-specific layout — sits inside (dashboard)/layout.tsx which already
// provides the sidebar and the <main> wrapper. This layer only adds the tab
// navigation that appears at the top of every /profile/* page.
// Search and other dashboard pages skip this and render their content directly.
export default function ProfileLayout({
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
