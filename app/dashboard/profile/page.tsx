"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearStoredUser, getStoredUser, type SessionUser } from "@/lib/session";
import { getSubmissions, type StoredSubmission } from "@/lib/submissions";
import AppHeader from "@/app/components/AppHeader";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { LogOut, UserRound } from "lucide-react";
import LoginModal from "@/app/components/LoginModal";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [mySubmissions, setMySubmissions] = useState<StoredSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    if (user) {
      const q = query(
        collection(db, "submissions"),
        where("email", "==", user.email),
        orderBy("submittedAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const subs: StoredSubmission[] = [];
        snapshot.forEach((doc) => {
          subs.push({ id: doc.id, ...doc.data() } as StoredSubmission);
        });
        setMySubmissions(subs);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  function handleLogout() {
    clearStoredUser();
    router.replace("/dashboard");
    window.location.reload();
  }

  function handleLoginSuccess() {
    const user = getStoredUser();
    setCurrentUser(user);
    if (user) {
      const all = getSubmissions().filter((s) => s.email === user.email);
      setMySubmissions(all);
    }
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col flex-1">
        <AppHeader onLoginClick={() => setShowLoginModal(true)} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Card className="p-10 max-w-sm border-b-[8px]">
            <div className="w-20 h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-text-muted)]">
              <UserRound size={40} />
            </div>
            <h2 className="text-[24px] font-black text-[var(--color-text-main)] mb-2 uppercase tracking-tight">Your Profile</h2>
            <p className="text-[var(--color-text-muted)] text-[15px] mb-8 font-medium">Log in to view your scores, rank, and mission history.</p>
            <Button variant="game" size="xl" onClick={() => setShowLoginModal(true)} className="w-full">Sign In to View</Button>
          </Card>
        </div>
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  const scoredSubmissions = mySubmissions.filter((s) => !!s.score);
  const roundsPlayed = mySubmissions.length;
  const bestScore = scoredSubmissions.length > 0 ? Math.max(...scoredSubmissions.map((s) => s.score!.total)) : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AppHeader isAdmin={currentUser.isAdmin} onLoginClick={() => setShowLoginModal(true)} />

      <div className="flex-1 overflow-y-auto mt-4 pr-1">
        {loading ? (
          <div className="flex flex-col gap-5 pb-10">
            {/* Skeleton identity card */}
            <div className="bg-white border-2 border-b-4 border-[var(--color-border)] rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-7 w-48 rounded-lg" />
                <Skeleton className="h-3 w-36 rounded-md" />
              </div>
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
            {/* Skeleton stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border-2 border-b-4 border-[var(--color-border)] rounded-2xl p-4 flex flex-col items-center gap-2">
                  <Skeleton className="h-8 w-10 rounded-lg" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              ))}
            </div>
            {/* Skeleton submissions */}
            <div className="bg-white border-2 border-b-4 border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-5">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-start gap-4 pb-5 border-b border-[#f0f0f0] last:border-none">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                    <Skeleton className="h-3 w-1/3 rounded-md" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-lg flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ) : (
        <div className="flex flex-col gap-5 pb-10">

          {/* Identity card */}
          <Card className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-blue)] to-[var(--color-green)] flex items-center justify-center text-[28px] font-black text-white flex-shrink-0 border-4 border-white shadow-[0_4px_0_var(--color-border)]">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[24px] font-black text-[var(--color-text-main)] m-0 leading-tight">{currentUser.name}</h1>
              <p className="text-[12px] font-black text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">{currentUser.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-center">
              <LogOut size={14} /> Log out
            </Button>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="text-center p-4">
              <span className="text-[28px] font-black text-[var(--color-blue)] block">{roundsPlayed}</span>
              <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">Rounds played</span>
            </Card>
            <Card className="text-center p-4">
              <span className="text-[28px] font-black text-[var(--color-blue)] block">{scoredSubmissions.length}</span>
              <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">Scored</span>
            </Card>
            <Card className="text-center p-4">
              <span className="text-[28px] font-black text-[var(--color-blue)] block">{bestScore !== null ? `${bestScore}/100` : "—"}</span>
              <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">Best score</span>
            </Card>
          </div>

          {/* Scored entries */}
          {mySubmissions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-[var(--color-text-muted)] font-black text-[14px]">You haven't submitted anything yet.</p>
            </Card>
          ) : (
            <Card className="p-6">
              <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide mb-4">Your submissions</p>
              <div className="flex flex-col">
                {mySubmissions.map((sub) => {
                  const scored = !!sub.score;
                  return (
                    <div key={sub.id} className="py-4 border-b border-[#f0f0f0] last:border-none">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-[16px] font-black text-[var(--color-text-main)] m-0">{sub.questTitle.replace(/\bRound\b/gi, "Week")}</h3>
                          <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">
                            {(() => {
                              if (!sub.submittedAt) return "Just now";
                              const date = (sub.submittedAt as any).toDate ? (sub.submittedAt as any).toDate() : new Date(sub.submittedAt);
                              return date.toLocaleDateString();
                            })()}
                          </p>
                        </div>
                        {scored ? (
                          <span className="text-[28px] font-black text-[var(--color-blue)] leading-none flex-shrink-0">
                            {sub.score!.total}<span className="text-[13px] text-[var(--color-text-muted)]">/100</span>
                          </span>
                        ) : (
                          <span className="text-[12px] font-black text-[var(--color-text-muted)] bg-[#f0f0f0] px-3 py-1 rounded-full">Pending review</span>
                        )}
                      </div>

                      {scored && (
                        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
                          {[
                            { label: "Strategic clarity", val: sub.score!.strategicClarity },
                            { label: "Creative quality", val: sub.score!.creativeQuality },
                            { label: "Token efficiency", val: sub.score!.tokenEfficiency },
                            { label: "Craft", val: sub.score!.craft },
                            { label: "Innovation", val: sub.score!.innovation || 0 },
                          ].map(({ label, val }) => (
                            <div key={label} className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide">{label}</span>
                              <span className="text-[13px] font-black text-[var(--color-text-main)]">{val}/20</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {scored && sub.score!.notes && (
                        <p className="text-[13px] text-[var(--color-text-muted)] mt-3 leading-relaxed italic">"{sub.score!.notes}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

        </div>
        )}
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
