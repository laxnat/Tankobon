"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#151F2E",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
          },
        }}
      />
    </SessionProvider>
  );
}