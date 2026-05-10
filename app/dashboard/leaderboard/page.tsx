"use client";

import { useRouter } from "next/navigation";
import AppHeader from "@/app/components/AppHeader";
import { useEffect, useState } from "react";
import { getStoredUser, type SessionUser } from "@/lib/session";
import { type StoredSubmission } from "@/lib/submissions";
import { Card } from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import LoginModal from "@/app/components/LoginModal";

type LeaderEntry = {
  name: string;
  email: string;
  score: number | null; // null = pending review
  tokensUsed: number;
};

function buildLeaderboard(submissions: StoredSubmission[]): Record<string, LeaderEntry[]> {
  if (submissions.length === 0) return {};

  const byQuest: Record<string, LeaderEntry[]> = {};

  submissions.forEach((s) => {
    const key = s.questTitle.replace(/\bRound\b/gi, "Week");
    if (!byQuest[key]) byQuest[key] = [];
    const existing = byQuest[key].find((e) => e.email === s.email);
    const score = s.score?.total ?? null;

    if (!existing) {
      byQuest[key].push({ name: s.name, email: s.email, score, tokensUsed: s.tokensUsed });
    } else if (score !== null && (existing.score === null || score > existing.score)) {
      existing.score = score;
    }
  });

  // Sort: scored entries first by score desc, then pending at bottom
  Object.keys(byQuest).forEach((k) => {
    byQuest[k].sort((a, b) => {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });
  });

  return byQuest;
}

export default function LeaderboardPage() {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [leaders, setLeaders] = useState<Record<string, LeaderEntry[]>>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setCurrentUser(getStoredUser());

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
      if (tabs.length > 0) setActiveTab((prev) => prev || tabs[0]);
    });

    return () => unsubscribe();
  }, []);

  function handleLoginSuccess() {
    setCurrentUser(getStoredUser());
  }

  const tabs = Object.keys(leaders);
  const currentLeaders = leaders[activeTab] ?? [];

  return (
    <div className="flex flex-col flex-1 h-full">
      <AppHeader isAdmin={currentUser?.isAdmin} onLoginClick={() => setShowLoginModal(true)} />

      {loading ? (
        <>
          {/* Skeleton tabs */}
          <div className="flex gap-2 mt-4 mb-5">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
          {/* Skeleton entries */}
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border-2 border-b-4 border-[var(--color-border)] rounded-2xl p-4 px-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <Skeleton className="h-6 w-36 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        </>
      ) : tabs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-[22px] font-black text-[var(--color-text-main)] mb-2">No submissions yet</h2>
          <p className="text-[var(--color-text-muted)] text-[15px]">Complete a quest to get on the leaderboard.</p>
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
              {currentLeaders.map((entry, index) => {
                const isPending = entry.score === null;
                // Only ranked entries get medal treatment
                const rank = isPending ? null : currentLeaders.slice(0, index + 1).filter(e => e.score !== null).length;
                const isMe = entry.email === currentUser?.email;

                return (
                  <Card
                    key={`${activeTab}-${index}`}
                    className={cn(
                      "p-4 px-6 flex items-center justify-between gap-4 border-b-[4px] transition-all",
                      isPending
                        ? "border-[var(--color-border)] bg-[var(--color-page-bg)] opacity-75"
                        : rank === 1 ? "border-[var(--color-yellow)] border-b-[var(--color-yellow-dark)] bg-[#fffef0]"
                        : rank === 2 ? "border-[#c0c0c0] border-b-[#999] bg-[#fafafa]"
                        : rank === 3 ? "border-[#cd7f32] border-b-[#a0522d] bg-[#fff8f4]"
                        : "border-[var(--color-border)]"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0",
                        isPending
                          ? "bg-[#f0f0f0] text-[var(--color-text-muted)]"
                          : rank === 1 ? "bg-[var(--color-yellow)] text-white shadow-[0_3px_0_var(--color-yellow-dark)]"
                          : rank === 2 ? "bg-[#c0c0c0] text-white shadow-[0_3px_0_#999]"
                          : rank === 3 ? "bg-[#cd7f32] text-white shadow-[0_3px_0_#a0522d]"
                          : "bg-[#f0f0f0] text-[var(--color-text-muted)]"
                      )}>
                        {isPending ? "—" : rank}
                      </div>

                      <div>
                        <h2 className="text-[20px] font-black leading-tight tracking-tight text-[var(--color-text-main)] m-0">
                          {entry.name}{isMe ? <span className="text-[12px] font-black text-[var(--color-blue)] ml-2">you</span> : null}
                        </h2>
                        {!isPending && rank === 1 && (
                          <span className="text-[10px] font-black text-[var(--color-yellow-dark)] uppercase tracking-widest">★ Top score</span>
                        )}
                        {isPending && (
                          <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Pending review</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {isPending ? (
                        <span className="text-[13px] font-black text-[var(--color-text-muted)] uppercase tracking-wide">—</span>
                      ) : (
                        <>
                          <span className={cn(
                            "text-[28px] font-black leading-none",
                            rank === 1 ? "text-[var(--color-yellow-dark)]"
                            : rank === 2 ? "text-[#999]"
                            : rank === 3 ? "text-[#cd7f32]"
                            : "text-[var(--color-blue)]"
                          )}>{entry.score}</span>
                          <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase ml-1 tracking-wider">/10</span>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
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
