"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "glass-panel border-white/10 text-white",
            title: "text-white",
            description: "text-white/70",
          },
        }}
      />
    </SessionProvider>
  );
}
