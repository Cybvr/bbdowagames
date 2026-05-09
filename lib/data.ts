import { allowedEmailDomain } from "./users";

export type Tab = "home" | "briefs" | "submit" | "leaderboard" | "judge";

export type GameStatus = "open" | "closed" | "pending";

export type Game = {
  id: string;
  week: number;
  title: string;
  submitTitle: string;
  eyebrow: string;
  description: string;
  status: GameStatus;
  statusLabel: string;
  meta: string[];
  criteria: string[];
  variant: "active" | "completed" | "locked";
};

export type Leader = {
  name: string;
  points: number;
  rounds: number;
  best: string;
};

export type ScoreRow = {
  label: string;
  score: number;
};

export type Submission = {
  id: string;
  name: string;
  email: string;
  gameTitle: string;
  tokenCount: number;
  aiScore: number;
  status: "pending" | "approved" | "needs-review";
};

export const tabs: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "briefs", label: "Quests" },
  { id: "leaderboard", label: "Leaderboard" },
];

export const tokenBudget = 1000;

export const games: Game[] = [];

export const weeklyLeaders: Record<string, Leader[]> = {};

export const scoreRows: ScoreRow[] = [
  { label: "Strategic clarity", score: 82 },
  { label: "Creative quality", score: 75 },
  { label: "Token efficiency", score: 91 },
  { label: "Craft", score: 78 },
];

export const submissions: Submission[] = [];
