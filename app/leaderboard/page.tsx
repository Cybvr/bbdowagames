"use client";

import { useRouter } from "next/navigation";
import AppHeader from "@/app/components/AppHeader";
import { useEffect, useState } from "react";
import { getStoredUser, type SessionUser } from "@/lib/session";
import { type StoredSubmission } from "@/lib/submissions";
import { Card } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import LoginModal from "@/app/components/LoginModal";

type LeaderEntry = {
  name: string;
  email: string;
  score: number;
  tokensUsed: number;
};

function buildLeaderboard(submissions: StoredSubmission[]): Record<string, LeaderEntry[]> {
  const scored = submissions.filter((s) => !!s.score);
  if (scored.length === 0) return {};

  const byQuest: Record<string, LeaderEntry[]> = {};

  scored.forEach((s) => {
    const key = s.questTitle.replace(/\bRound\b/gi, "Week");
    if (!byQuest[key]) byQuest[key] = [];
    const existing = byQuest[key].find((e) => e.email === s.email);
    if (!existing) {
      byQuest[key].push({ name: s.name, email: s.email, score: s.score!.total, tokensUsed: s.tokensUsed });
    } else if (s.score!.total > existing.score) {
      existing.score = s.score!.total;
    }
  });

  // Sort each quest by score desc
  Object.keys(byQuest).forEach((k) => {
    byQuest[k].sort((a, b) => b.score - a.score);
  });

  return byQuest;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [leaders, setLeaders] = useState<Record<string, LeaderEntry[]>>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setCurrentUser(getStoredUser());

    // Fetch submissions from Firestore
    const q = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs: StoredSubmission[] = [];
      snapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as StoredSubmission);
      });
      
      const board = buildLeaderboard(subs);
      setLeaders(board);
      setLoading(false);
      
      const tabs = Object.keys(board);
      if (tabs.length > 0 && !activeTab) setActiveTab(tabs[0]);
    });

    return () => unsubscribe();
  }, [activeTab]);

  function handleLoginSuccess() {
    setCurrentUser(getStoredUser());
  }

  if (loading) {
    return (
      <Card className="p-8 text-center" aria-live="polite">
        <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide">Checking scores</p>
        <h1 className="text-[32px] font-black leading-tight tracking-tight text-[var(--color-text-main)]">Loading leaderboard...</h1>
      </Card>
    );
  }

  const tabs = Object.keys(leaders);
  const currentLeaders = leaders[activeTab] ?? [];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AppHeader isAdmin={currentUser?.isAdmin} onLoginClick={() => setShowLoginModal(true)} />

      {tabs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-[22px] font-black text-[var(--color-text-main)] mb-2">No scores yet</h2>
          <p className="text-[var(--color-text-muted)] text-[15px]">Scores will appear here once the judge reviews submissions.</p>
        </div>
      ) : (
        <>
          {/* Quest tabs */}
          <div className="flex gap-2 mt-4 mb-5 overflow-x-auto pb-2 scrollbar-none flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all border-2 border-b-4 whitespace-nowrap",
                  activeTab === tab
                    ? "bg-[var(--color-blue)] text-white border-[var(--color-blue-dark)]"
                    : "bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[#f0f0f0]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <div className="flex flex-col gap-3 pb-10">
              {currentLeaders.map((entry, index) => (
                <Card
                  key={`${activeTab}-${index}`}
                  className={cn(
                    "p-4 px-6 flex items-center justify-between gap-4 border-b-[4px] transition-all",
                    index === 0 ? "border-[var(--color-yellow)] border-b-[var(--color-yellow-dark)] bg-[#fffef0]" :
                    index === 1 ? "border-[#c0c0c0] border-b-[#999] bg-[#fafafa]" :
                    index === 2 ? "border-[#cd7f32] border-b-[#a0522d] bg-[#fff8f4]" :
                    "border-[var(--color-border)]"
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0",
                      index === 0 ? "bg-[var(--color-yellow)] text-white shadow-[0_3px_0_var(--color-yellow-dark)]" :
                      index === 1 ? "bg-[#c0c0c0] text-white shadow-[0_3px_0_#999]" :
                      index === 2 ? "bg-[#cd7f32] text-white shadow-[0_3px_0_#a0522d]" :
                      "bg-[#f0f0f0] text-[var(--color-text-muted)]"
                    )}>
                      {index + 1}
                    </div>

                    <div>
                      <h2 className="text-[20px] font-black leading-tight tracking-tight text-[var(--color-text-main)] m-0">
                        {entry.name}
                      </h2>
                      {index === 0 && (
                        <span className="text-[10px] font-black text-[var(--color-yellow-dark)] uppercase tracking-widest">★ Top score</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className={cn(
                      "text-[28px] font-black leading-none",
                      index === 0 ? "text-[var(--color-yellow-dark)]" :
                      index === 1 ? "text-[#999]" :
                      index === 2 ? "text-[#cd7f32]" :
                      "text-[var(--color-blue)]"
                    )}>{entry.score}</span>
                    <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase ml-1 tracking-wider">/10</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
