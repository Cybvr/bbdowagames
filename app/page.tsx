"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getStoredUser } from "@/lib/session";
import { Card } from "@/app/components/ui/card";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getStoredUser() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <Card className="p-8 text-center" aria-live="polite">
      <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide">Brief to Brilliant</p>
      <h1 className="text-[32px] font-black leading-tight tracking-tight text-[var(--color-text-main)]">Loading your challenge...</h1>
    </Card>
  );
}
