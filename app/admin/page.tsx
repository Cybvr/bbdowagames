"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/app/components/AppHeader";
import { useEffect, useState } from "react";
import { games } from "@/lib/data";
import { getStoredUser, type SessionUser } from "@/lib/session";
import { type StoredSubmission } from "@/lib/submissions";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { fetchQuests, fetchUserSubmissions } from "@/lib/firestore-service";
import { Game } from "@/lib/data";
import { seedFirestore } from "@/lib/seed";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [submissions, setSubmissions] = useState<StoredSubmission[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  const openGames = games.filter((game) => game.status === "open");

  useEffect(() => {
    // Real-time listener for submissions
    const q = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
    const unsubscribeSub = onSnapshot(q, (snapshot) => {
      const subs: StoredSubmission[] = [];
      snapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as StoredSubmission);
      });
      setSubmissions(subs);
    });

    // Real-time listener for quests
    const unsubscribeQuests = onSnapshot(collection(db, "quests"), (snapshot) => {
      const qsts: Game[] = [];
      snapshot.forEach((doc) => {
        qsts.push({ id: doc.id, ...doc.data() } as Game);
      });
      setGames(qsts.sort((a, b) => b.week - a.week));
    });

    return () => {
      unsubscribeSub();
      unsubscribeQuests();
    };
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    if (!storedUser.isAdmin) {
      router.replace("/dashboard");
      return;
    }

    setCurrentUser(storedUser);
  }, [router]);

  if (!currentUser) {
    return (
      <main className="game-shell">
        <Card className="loading-card" aria-live="polite">
          <p className="game-eyebrow">Checking access</p>
          <h1>Loading admin...</h1>
        </Card>
      </main>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AppHeader isAdmin={true} />

      <div className="flex-1 overflow-y-auto mt-4 pr-1">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-3" aria-label="Admin summary">
        <Card className="text-center p-4">
          <span className="text-[28px] font-black text-[var(--color-blue)] block">{games.length}</span>
          <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">Total quests</span>
        </Card>
        <Card className="text-center p-4">
          <span className="text-[28px] font-black text-[var(--color-blue)] block">{openGames.length}</span>
          <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">Live now</span>
        </Card>
        <Card className="text-center p-4">
          <span className="text-[28px] font-black text-[var(--color-blue)] block">{submissions.filter(s => !s.score).length}</span>
          <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">To score</span>
        </Card>
        <Card className="text-center p-4">
          <span className="text-[28px] font-black text-[var(--color-blue)] block">{submissions.length === 0 ? 0 : Math.round(submissions.reduce((t, s) => t + s.tokensUsed, 0) / submissions.length).toLocaleString()}</span>
          <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">Avg tokens used</span>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="p-6">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mb-0.5 tracking-wide">Quest library</p>
              <h2 className="text-[28px] font-black leading-tight tracking-tight text-[var(--color-text-main)] m-0">Games</h2>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="game">New quest</Button>
            </div>
          </div>

          <div className="flex flex-col">
            {games.map((game) => (
              <div className="flex items-center gap-4 py-3 border-b border-[#f0f0f0] last:border-none" key={game.id}>
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[14px] font-black bg-[#f0f0f0] border-2 border-[var(--color-border)] border-b-4 text-[#afafaf] flex-shrink-0" aria-hidden="true">
                  {game.week}
                </div>
                <div style={{ flex: 1, marginLeft: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 900, margin: 0 }}>{game.title}</h3>
                  <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide" style={{ fontSize: '10px', marginTop: '2px' }}>{game.meta.join(" - ")}</p>
                </div>
                <Badge variant="game">{game.statusLabel}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section style={{ marginTop: '24px' }}>
        <Card className="p-6">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mb-0.5 tracking-wide">Scoring queue</p>
              <h2 className="text-[28px] font-black leading-tight tracking-tight text-[var(--color-text-main)] m-0">Review submissions</h2>
            </div>
            <Badge variant="game" style={{ background: 'var(--color-text-muted)', borderBottomColor: '#999' }}>
              {submissions.length} {submissions.length === 1 ? "entry" : "entries"}
            </Badge>
          </div>

          <div className="review-list">
            {submissions.length === 0 ? (
              <p className="text-[var(--color-text-muted)] text-[14px] font-black text-center py-8">No submissions yet.</p>
            ) : submissions.map((submission) => {
              const isScored = !!submission.score;
              return (
                <div key={submission.id} style={{ borderBottom: '2px solid #f0f0f0', padding: '20px 0' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>{submission.name} — {submission.questTitle.replace(/\bRound\b/gi, "Week")}</h3>
                      <p className="text-[12px] font-black text-[var(--color-text-muted)] uppercase mt-1">{submission.email} · {new Date(submission.submittedAt).toLocaleString()}</p>
                    </div>
                    <Badge variant="game" style={isScored ? {} : { background: 'var(--color-text-muted)', borderBottomColor: '#999' }}>
                      {isScored ? `${submission.score!.total}/10` : "Unscored"}
                    </Badge>
                  </div>

                  {submission.response && (
                    <p className="text-[14px] text-[var(--color-text-main)] my-3 leading-relaxed line-clamp-3">{submission.response}</p>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[12px] font-black text-[var(--color-text-muted)]">
                      {submission.tokensUsed.toLocaleString()} tokens
                    </span>
                    <Link href={`/admin/submission/${submission.id}`}>
                      <Button variant="game" size="sm">{isScored ? "Edit score" : "Score entry"}</Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  </div>
);
}
