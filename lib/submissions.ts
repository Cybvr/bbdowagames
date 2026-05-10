export type SubmissionScore = {
  strategicClarity: number;
  creativeQuality: number;
  tokenEfficiency: number;
  craft: number;
  innovation: number;
  notes: string;
  total: number;
};

export type StoredSubmission = {
  id: string;
  name: string;
  email: string;
  questId: string;
  questTitle: string;
  response: string;
  imageUrl: string | null;
  tokensUsed: number;
  submittedAt: string;
  score?: SubmissionScore;
};

const key = "wq-submissions";

export function getSubmissions(): StoredSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

export function saveSubmission(sub: StoredSubmission) {
  const all = getSubmissions();
  // prevent duplicate entries for same email + quest
  if (all.some((s) => s.email === sub.email && s.questId === sub.questId)) return;
  localStorage.setItem(key, JSON.stringify([...all, sub]));
}

export function saveScore(id: string, score: SubmissionScore) {
  const all = getSubmissions();
  const updated = all.map((s) => s.id === id ? { ...s, score } : s);
  localStorage.setItem(key, JSON.stringify(updated));
}

export function hasSubmitted(email: string, questId: string): boolean {
  return getSubmissions().some(s => s.email === email && s.questId === questId);
}
