"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { label: "Overview", href: "/profile" },
  { label: "Settings", href: "/settings" },
] as const;

/*
  Why tabs-as-links instead of tabs-as-state?

  shadcn Tabs are typically used for in-page content switching (one URL, different
  content shown). Here we want navigation — different URLs, with the tab just reflecting
  where you are. So instead of managing `value` in state, we derive it from the current
  pathname and render each trigger as a Next.js Link.

  The `render` prop on TabsTrigger (base-ui's asChild equivalent) swaps the default
  <button> for a <Link>, which means the browser handles navigation natively —
  prefetching, history, accessibility all work for free.
*/
export function ProfileTabs() {
  const pathname = usePathname();

  // Match the active tab: /profile matches "Overview", /settings matches "Settings", etc.
  const activeTab =
    TABS.find((t) => t.href === pathname)?.href ?? TABS[0].href;

  return (
    <Tabs value={activeTab} className="mb-6">
      <TabsList variant="line" className="w-full justify-start border-b border-white/[0.07] rounded-none pb-0 h-auto gap-0">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.href}
            value={tab.href}
            className="px-4 pb-3 rounded-none text-white/50 data-active:text-white"
            render={<Link href={tab.href} />}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
