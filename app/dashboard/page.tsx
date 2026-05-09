"use client";

import { useRouter } from "next/navigation";
import AppHeader from "@/app/components/AppHeader";
import { useEffect, useState } from "react";
import { games } from "@/lib/data";
import { getStoredUser, type SessionUser } from "@/lib/session";
import { hasSubmitted } from "@/lib/submissions";
import QuestComponent from "@/app/components/QuestComponent";
import { Card } from "@/app/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    setCurrentUser(storedUser);
  }, [router]);

  function goSubmit(title: string) {
    const game = games.find(g => g.submitTitle === title || g.title.includes(title));
    if (game && currentUser && hasSubmitted(currentUser.email, game.id)) return;
    router.push(`/submit?title=${encodeURIComponent(title)}`);
  }

  if (!currentUser) {
    return (
      <Card className="p-8 text-center" aria-live="polite">
        <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide">Checking session</p>
        <h1 className="text-[32px] font-black leading-tight tracking-tight text-[var(--color-text-main)]">Loading dashboard...</h1>
      </Card>
    );
  }

  return (
    <section className="flex flex-col flex-1" aria-label="Brief to Brilliant dashboard">
      <AppHeader isAdmin={currentUser.isAdmin} />
      <HomeTab email={currentUser.email} onStartQuest={goSubmit} />
    </section>
  );
}

function HomeTab({ email, onStartQuest }: { email: string; onStartQuest: (title: string) => void }) {
  const activeGame = games.find((g) => g.variant === "active");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (activeGame) setDone(hasSubmitted(email, activeGame.id));
  }, [email, activeGame?.id]);

  return (
    <div className="flex flex-col flex-1 justify-center items-center">
      {done || !activeGame ? (
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-[22px] font-black text-[var(--color-text-main)] mb-2">You're done!</h2>
          <p className="text-[var(--color-text-muted)] text-[15px]">No active quests right now. Check back soon.</p>
        </div>
      ) : (
        <QuestComponent
          game={activeGame}
          onStart={onStartQuest}
          variant="hero"
        />
      )}
    </div>
  );
}
