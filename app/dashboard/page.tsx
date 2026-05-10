"use client";

import { useRouter } from "next/navigation";
import AppHeader from "@/app/components/AppHeader";
import { useEffect, useState } from "react";
import { type Game } from "@/lib/data";
import { getStoredUser, type SessionUser } from "@/lib/session";
import QuestComponent from "@/app/components/QuestComponent";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import LoginModal from "@/app/components/LoginModal";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

function HomeTab({
  activeGame,
  hasSubmittedActive,
  isLoadingQuests,
  onStartQuest,
  isLoggedIn,
  onLoginClick,
  isLoadingSubmissions,
}: {
  activeGame: Game | null;
  hasSubmittedActive: boolean;
  isLoadingQuests: boolean;
  onStartQuest: (title: string) => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  isLoadingSubmissions?: boolean;
}) {
  if (isLoadingSubmissions) {
    return (
      <div className="w-full max-w-xl">
        <div className="bg-white border-[3px] border-[#e5e5e5] rounded-[30px] p-5 md:p-8 flex flex-col gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto rounded-xl" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-5/6 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-4/6 mx-auto rounded-lg" />
          <Skeleton className="h-[54px] w-full md:w-[140px] rounded-[14px] mt-2 md:self-end" />
        </div>
      </div>
    );
  }
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 bg-white rounded-[30px] border-2 border-b-[8px] border-[var(--color-border)] shadow-xl max-w-sm">
        <div className="w-20 h-20 mb-6 overflow-hidden rounded-2xl ">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-[28px] font-black text-[var(--color-text-main)] mb-3 leading-tight">WieldQuest</h2>
        <p className="text-[var(--color-text-description)] text-[16px] mb-8 font-medium">Use AI as your weapon. Tackle this week's quest and climb the leaderboard.</p>
        <Button variant="game" size="xl" onClick={onLoginClick} className="w-full">Sign In to Start</Button>
      </div>
    );
  }

  if (isLoadingQuests) {
    return (
      <div className="text-center max-w-sm">
        <h2 className="text-[22px] font-black text-[var(--color-text-main)] mb-2">Loading quest...</h2>
        <p className="text-[var(--color-text-muted)] text-[15px]">Checking what is live right now.</p>
      </div>
    );
  }

  if (!activeGame) {
    return (
      <div className="text-center max-w-sm">
        <h2 className="text-[22px] font-black text-[var(--color-text-main)] mb-2">No active quest right now.</h2>
        <p className="text-[var(--color-text-muted)] text-[15px]">Check back soon.</p>
      </div>
    );
  }

  if (hasSubmittedActive) {
    return (
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-[22px] font-black text-[var(--color-text-main)] mb-2">You're done!</h2>
        <p className="text-[var(--color-text-muted)] text-[15px]">You have already submitted this quest.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 justify-center items-center">
      <QuestComponent
        game={activeGame}
        onStart={onStartQuest}
        variant="hero"
        submitted={hasSubmittedActive}
      />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<string[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  useEffect(() => {
    const unsubscribeQuests = onSnapshot(collection(db, "quests"), (snapshot) => {
      const qsts: Game[] = [];
      snapshot.forEach((doc) => {
        qsts.push({ id: doc.id, ...doc.data() } as Game);
      });
      setGames(qsts.sort((a, b) => b.week - a.week));
      setIsLoadingQuests(false);
    });

    return () => unsubscribeQuests();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setUserSubmissions([]);
      setIsLoadingSubmissions(false);
      return;
    }

    setIsLoadingSubmissions(true);
    const submissionsQuery = query(
      collection(db, "submissions"),
      where("email", "==", currentUser.email)
    );

    const unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
      const submittedQuestIds: string[] = [];
      snapshot.forEach((doc) => {
        submittedQuestIds.push(doc.data().questId);
      });
      setUserSubmissions(submittedQuestIds);
      setIsLoadingSubmissions(false);
    });

    return () => unsubscribeSubmissions();
  }, [currentUser]);

  function handleAction(action: () => void) {
    if (!currentUser) {
      setPendingAction(() => action);
      setShowLoginModal(true);
      return;
    }
    action();
  }

  function goSubmit(id: string) {
    handleAction(() => {
      const game = games.find(g => g.id === id);
      if (game && currentUser && userSubmissions.includes(game.id)) return;
      router.push(`/dashboard/quests/${id}`);
    });
  }

  function handleLoginSuccess() {
    const user = getStoredUser();
    setCurrentUser(user);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }

  const openGames = games.filter((game) => game.status === "open" && game.variant !== "locked");
  const activeGame = openGames.find((game) => game.variant === "active") ?? openGames[0] ?? null;
  const hasSubmittedActive = activeGame ? userSubmissions.includes(activeGame.id) : false;

  return (
    <section className="flex flex-col flex-1" aria-label="WieldQuest dashboard">
      <AppHeader isAdmin={currentUser?.isAdmin} onLoginClick={() => setShowLoginModal(true)} />

      <div className="flex-1 flex flex-col items-center justify-center">
        <HomeTab
          activeGame={activeGame}
          hasSubmittedActive={hasSubmittedActive}
          isLoadingQuests={isLoadingQuests}
          isLoadingSubmissions={isLoadingSubmissions}
          onStartQuest={goSubmit}
          isLoggedIn={!!currentUser}
          onLoginClick={() => setShowLoginModal(true)}
        />
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </section>
  );
}
