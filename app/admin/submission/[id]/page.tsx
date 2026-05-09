"use client";

import { useRouter, useParams } from "next/navigation";
import AppHeader from "@/app/components/AppHeader";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/session";
import { getSubmissions, saveScore, type StoredSubmission, type SubmissionScore } from "@/lib/submissions";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";

const criteria: { key: keyof Omit<SubmissionScore, "notes" | "total">; label: string; weight: number }[] = [
  { key: "strategicClarity", label: "Strategic clarity", weight: 30 },
  { key: "creativeQuality", label: "Creative quality", weight: 30 },
  { key: "tokenEfficiency", label: "Token efficiency", weight: 20 },
  { key: "craft", label: "Craft", weight: 20 },
];

function weightedTotal(scores: Record<string, number>): number {
  return Math.round(
    criteria.reduce((sum, c) => sum + (scores[c.key] ?? 0) * (c.weight / 100), 0)
  );
}

export default function SubmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [submission, setSubmission] = useState<StoredSubmission | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saved, setSaved] = useState(false);

  const [scores, setScores] = useState<Record<string, number>>({
    strategicClarity: 0,
    creativeQuality: 0,
    tokenEfficiency: 0,
    craft: 0,
  });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) { router.replace("/login"); return; }
    if (!storedUser.isAdmin) { router.replace("/dashboard"); return; }
    setIsAdmin(true);

    const all = getSubmissions();
    const found = all.find((s) => s.id === params.id);
    if (!found) { router.replace("/admin"); return; }
    setSubmission(found);

    if (found.score) {
      setScores({
        strategicClarity: found.score.strategicClarity,
        creativeQuality: found.score.creativeQuality,
        tokenEfficiency: found.score.tokenEfficiency,
        craft: found.score.craft,
      });
      setNotes(found.score.notes);
      setSaved(true);
    }
  }, [router, params.id]);

  function handleSave() {
    if (!submission) return;
    const total = weightedTotal(scores);
    saveScore(submission.id, {
      strategicClarity: scores.strategicClarity,
      creativeQuality: scores.creativeQuality,
      tokenEfficiency: scores.tokenEfficiency,
      craft: scores.craft,
      notes,
      total,
    });
    setSaved(true);
  }

  if (!submission) {
    return (
      <main className="game-shell">
        <Card className="loading-card" aria-live="polite">
          <p className="game-eyebrow">Loading</p>
          <h1>Fetching submission...</h1>
        </Card>
      </main>
    );
  }

  const submitted = new Date(submission.submittedAt).toLocaleString();
  const total = weightedTotal(scores);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AppHeader isAdmin={isAdmin} />

      <div className="flex-1 overflow-y-auto mt-6 pr-1">
        <div className="max-w-2xl mx-auto w-full pb-8">
          <button
            onClick={() => router.back()}
            className="text-[12px] font-black text-[var(--color-text-muted)] hover:text-[var(--color-blue)] uppercase tracking-wide mb-4 flex items-center gap-1"
          >
            ← Back
          </button>

          <div className="flex flex-col gap-5">
            {/* Header */}
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide mb-0.5">Submission</p>
                  <h1 className="text-[26px] font-black leading-tight text-[var(--color-text-main)] m-0">{submission.name}</h1>
                  <p className="text-[12px] font-black text-[var(--color-text-muted)] mt-1">{submission.email} · {submitted}</p>
                  <p className="text-[13px] font-black text-[var(--color-text-main)] mt-2">{submission.questTitle.replace(/\bRound\b/gi, "Week")}</p>
                </div>
                <Badge variant="game" style={saved ? {} : { background: 'var(--color-text-muted)', borderBottomColor: '#999' }}>
                  {saved ? `${submission.score?.total ?? total}/10` : "Unscored"}
                </Badge>
              </div>
            </Card>

            {/* Response */}
            <Card className="p-6">
              <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Response</p>
              <p className="text-[15px] text-[var(--color-text-main)] leading-relaxed whitespace-pre-wrap">{submission.response}</p>
              {submission.imageUrl && (
                <img
                  src={submission.imageUrl}
                  alt="Submission"
                  className="rounded-xl border-2 border-[var(--color-border)] max-w-full object-contain mt-4"
                />
              )}
              <p className="text-[12px] font-black text-[var(--color-text-muted)] mt-4">
                {submission.tokensUsed.toLocaleString()} tokens used
              </p>
            </Card>

            {/* Scoring */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide mb-0.5">Judge scoring</p>
                  <h2 className="text-[22px] font-black text-[var(--color-text-main)] m-0">Score this entry</h2>
                </div>
                <span className="text-[32px] font-black text-[var(--color-blue)]">{total}<span className="text-[16px] text-[var(--color-text-muted)]">/10</span></span>
              </div>

              <div className="flex flex-col gap-5">
                {criteria.map((c) => (
                  <div key={c.key}>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[13px] font-black text-[var(--color-text-main)]">{c.label}</label>
                      <span className="text-[11px] font-black text-[var(--color-text-muted)]">{c.weight}% weight · {scores[c.key]}/10</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={scores[c.key]}
                      onChange={(e) => {
                        setSaved(false);
                        setScores((prev) => ({ ...prev, [c.key]: Number(e.target.value) }));
                      }}
                      className="w-full accent-[var(--color-blue)]"
                    />
                    <div className="flex justify-between text-[10px] font-black text-[var(--color-text-muted)] mt-0.5">
                      <span>0</span><span>5</span><span>10</span>
                    </div>
                  </div>
                ))}

                <div>
                  <label className="text-[13px] font-black text-[var(--color-text-main)] block mb-1.5">Judge notes</label>
                  <Textarea
                    placeholder="Optional feedback for the player..."
                    rows={3}
                    value={notes}
                    onChange={(e) => { setSaved(false); setNotes(e.target.value); }}
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="game" onClick={handleSave} disabled={saved}>
                    {saved ? "Score saved" : "Save score"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
