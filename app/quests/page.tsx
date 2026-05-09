"use client";

import { useRouter } from "next/navigation";
import AppHeader from "@/app/components/AppHeader";
import { useEffect, useState } from "react";
import { getStoredUser, type SessionUser } from "@/lib/session";
import QuestComponent from "@/app/components/QuestComponent";
import { Card } from "@/app/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { Game } from "@/lib/data";
import LoginModal from "@/app/components/LoginModal";

export default function QuestsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);

    // Fetch quests from Firestore
    const unsubscribeQuests = onSnapshot(collection(db, "quests"), (snapshot) => {
      const qsts: Game[] = [];
      snapshot.forEach((doc) => {
        qsts.push({ id: doc.id, ...doc.data() } as Game);
      });
      setGames(qsts.sort((a, b) => b.week - a.week));
      setLoading(false);
    });

    // Fetch user submissions to check status if logged in
    if (user) {
      const fetchSubmissions = async () => {
        const q = query(collection(db, "submissions"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        const submittedQuestIds: string[] = [];
        querySnapshot.forEach((doc) => {
          submittedQuestIds.push(doc.data().questId);
        });
        setUserSubmissions(submittedQuestIds);
      };
      fetchSubmissions();
    }

    return () => unsubscribeQuests();
  }, []);

  function handleAction(action: () => void) {
    if (!currentUser) {
      setPendingAction(() => action);
      setShowLoginModal(true);
      return;
    }
    action();
  }

  function goSubmit(title: string) {
    handleAction(() => {
      const game = games.find(g => g.submitTitle === title || g.title.includes(title));
      if (game && currentUser && userSubmissions.includes(game.id)) {
        setToast("You've already submitted this quest!");
        setTimeout(() => setToast(""), 3000);
        return;
      }
      router.push(`/submit?title=${encodeURIComponent(title)}`);
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

  if (loading) {
    return (
      <Card className="p-8 text-center" aria-live="polite">
        <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide">Checking quests</p>
        <h1 className="text-[32px] font-black leading-tight tracking-tight text-[var(--color-text-main)]">Loading challenge board...</h1>
      </Card>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader isAdmin={currentUser?.isAdmin} onLoginClick={() => setShowLoginModal(true)} />
      
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full font-black shadow-lg animate-bounce">
          {toast}
        </div>
      )}

      <div className="flex-1 overflow-y-auto mt-4 pr-1">
        <div className="flex flex-col gap-4 pb-10">
          <div className="grid grid-cols-1 gap-4">
            {games
              .filter((g) => g.status === "open" && g.variant !== "locked")
              .map((game) => (
                <QuestComponent
                  key={game.id}
                  game={game}
                  onStart={goSubmit}
                  submitted={userSubmissions.includes(game.id)}
                />
              ))}
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
