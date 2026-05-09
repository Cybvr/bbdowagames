"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearStoredUser, getStoredUser, type SessionUser } from "@/lib/session";
import { getSubmissions, type StoredSubmission } from "@/lib/submissions";
import AppHeader from "@/app/components/AppHeader";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [mySubmissions, setMySubmissions] = useState<StoredSubmission[]>([]);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) { router.replace("/login"); return; }
    setCurrentUser(storedUser);
    const all = getSubmissions().filter((s) => s.email === storedUser.email);
    setMySubmissions(all);
  }, [router]);

  function handleLogout() {
    clearStoredUser();
    router.replace("/login");
  }

  if (!currentUser) {
    return (
      <main className="game-shell">
        <Card className="loading-card" aria-live="polite">
          <p className="game-eyebrow">Checking session</p>
          <h1>Loading profile...</h1>
        </Card>
      </main>
    );
  }

  const scoredSubmissions = mySubmissions.filter((s) => !!s.score);
  const roundsPlayed = mySubmissions.length;
  const bestScore = scoredSubmissions.length > 0 ? Math.max(...scoredSubmissions.map((s) => s.score!.total)) : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AppHeader isAdmin={currentUser.isAdmin} />

      <div className="flex-1 overflow-y-auto mt-4 pr-1">
        <div className="flex flex-col gap-5 pb-10">

          {/* Identity card */}
          <Card className="p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-blue)] to-[var(--color-green)] flex items-center justify-center text-[28px] font-black text-white flex-shrink-0 border-4 border-white shadow-[0_4px_0_var(--color-border)]">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[24px] font-black text-[var(--color-text-main)] m-0 leading-tight">{currentUser.name}</h1>
              <p className="text-[12px] font-black text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">{currentUser.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 flex-shrink-0">
              <LogOut size={14} /> Log out
            </Button>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center p-4">
              <span className="text-[28px] font-black text-[var(--color-blue)] block">{roundsPlayed}</span>
              <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">Rounds played</span>
            </Card>
            <Card className="text-center p-4">
              <span className="text-[28px] font-black text-[var(--color-blue)] block">{scoredSubmissions.length}</span>
              <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">Scored</span>
            </Card>
            <Card className="text-center p-4">
              <span className="text-[28px] font-black text-[var(--color-blue)] block">{bestScore !== null ? `${bestScore}/10` : "—"}</span>
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
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {scored ? (
                          <span className="text-[28px] font-black text-[var(--color-blue)] leading-none flex-shrink-0">
                            {sub.score!.total}<span className="text-[13px] text-[var(--color-text-muted)]">/10</span>
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
                          ].map(({ label, val }) => (
                            <div key={label} className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide">{label}</span>
                              <span className="text-[13px] font-black text-[var(--color-text-main)]">{val}/10</span>
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
      </div>
    </div>
  );
}
