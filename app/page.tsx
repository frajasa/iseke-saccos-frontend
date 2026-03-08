"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "loading") {
      if (status === "authenticated") {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}
