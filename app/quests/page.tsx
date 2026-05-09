"use client";

import { useRouter } from "next/navigation";
import AppHeader from "@/app/components/AppHeader";
import { useEffect, useState } from "react";
import { games } from "@/lib/data";
import { getStoredUser, type SessionUser } from "@/lib/session";
import { hasSubmitted } from "@/lib/submissions";
import QuestComponent from "@/app/components/QuestComponent";
import { Card } from "@/app/components/ui/card";

export default function QuestsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [toast, setToast] = useState("");

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
    if (game && currentUser && hasSubmitted(currentUser.email, game.id)) {
      setToast("You've already submitted this quest!");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    router.push(`/submit?title=${encodeURIComponent(title)}`);
  }

  if (!currentUser) {
    return (
      <Card className="p-8 text-center" aria-live="polite">
        <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide">Checking session</p>
        <h1 className="text-[32px] font-black leading-tight tracking-tight text-[var(--color-text-main)]">Loading quests...</h1>
      </Card>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader isAdmin={currentUser.isAdmin} />
      
      <div className="flex-1 overflow-y-auto mt-4 pr-1">
        <div className="flex flex-col gap-4 pb-10">
          <div className="grid grid-cols-1 gap-4">
            {games
              .filter((g) => g.variant !== "locked")
              .map((game) => (
                <QuestComponent
                  key={game.id}
                  game={game}
                  onStart={goSubmit}
                  submitted={hasSubmitted(currentUser.email, game.id)}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
