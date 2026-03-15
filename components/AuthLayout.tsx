"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-[var(--sidebar-width,256px)] transition-all duration-200">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-8 py-3 no-print">
          <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            <div className="lg:hidden w-10" />
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
