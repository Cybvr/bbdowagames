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

export const games: Game[] = [
  {
    id: "crisis-comms-week-4",
    week: 4,
    title: "Week 4 - KudiPay Crisis",
    submitTitle: "KudiPay Crisis - Week 4",
    eyebrow: "Live quest",
    description:
      "KudiPay's app crashed during its own launch. The internet is watching. You have 5 minutes and an AI to help the brand respond — use it however you think is right. What does KudiPay do next?",
    status: "open",
    statusLabel: "Open",
    meta: ["May 8th - May 15th"],
    criteria: [
      "Strategic clarity 30%",
      "Creative quality 30%",
      "Token efficiency 20%",
      "Craft 20%",
    ],
    variant: "active",
  },
  {
    id: "campaign-concept-week-3",
    week: 3,
    title: "Week 3 - Zuma Energy Rebrand",
    submitTitle: "Zuma Energy Rebrand - Week 3",
    eyebrow: "Completed",
    description:
      "Develop a campaign concept for Zuma Energy, a challenger brand targeting 25-35 year olds who distrust big utilities. Headline, tagline, three content pillars, one activation idea.",
    status: "closed",
    statusLabel: "Closed",
    meta: ["Winner: Duzie Ikwuegbu"],
    criteria: [
      "Strategic clarity 30%",
      "Creative quality 30%",
      "Token efficiency 20%",
      "Craft 20%",
    ],
    variant: "completed",
  },
  {
    id: "pitch-opener-week-5",
    week: 5,
    title: "Week 5 - Eko Vista Luxury Pitch",
    submitTitle: "Eko Vista Luxury Pitch - Week 5",
    eyebrow: "Locked",
    description:
      "Write the opening two slides of a new business pitch for Eko Vista, a luxury hotel group wanting to build their social presence in Southeast Asia.",
    status: "pending",
    statusLabel: "Coming soon",
    meta: ["Opens Monday"],
    criteria: [
      "Strategic clarity 30%",
      "Creative quality 30%",
      "Token efficiency 20%",
      "Craft 20%",
    ],
    variant: "locked",
  },
];

export const weeklyLeaders: Record<string, Leader[]> = {
  "Week 1": [
    { name: "Duzie Ikwuegbu", points: 94, rounds: 1, best: "Zuma Energy" },
    { name: "Stephen Ifebajo", points: 88, rounds: 1, best: "Zuma Energy" },
    { name: "Emeka Ajuzie", points: 72, rounds: 1, best: "Zuma Energy" },
  ],
  "Week 2": [
    { name: "Stephen Ifebajo", points: 92, rounds: 1, best: "KudiPay Crisis" },
    { name: "Tolulope Badamassi", points: 89, rounds: 1, best: "KudiPay Crisis" },
    { name: "Duzie Ikwuegbu", points: 85, rounds: 1, best: "KudiPay Crisis" },
  ],
  "Week 3": [
    { name: "Tolulope Badamassi", points: 96, rounds: 1, best: "Eko Vista" },
    { name: "Duzie Ikwuegbu", points: 91, rounds: 1, best: "Eko Vista" },
    { name: "Stephen Ifebajo", points: 84, rounds: 1, best: "Eko Vista" },
  ],
  "Current Week": [
    { name: "Duzie Ikwuegbu", points: 286, rounds: 3, best: "Zuma Energy" },
    { name: "Stephen Ifebajo", points: 241, rounds: 3, best: "KudiPay Crisis" },
    { name: "Tolulope Badamassi", points: 228, rounds: 2, best: "Eko Vista" },
    { name: "Emeka Ajuzie", points: 195, rounds: 3, best: "Zuma Energy" },
  ],
};

export const scoreRows: ScoreRow[] = [
  { label: "Strategic clarity", score: 82 },
  { label: "Creative quality", score: 75 },
  { label: "Token efficiency", score: 91 },
  { label: "Craft", score: 78 },
];

export const submissions: Submission[] = [
  {
    id: "sub-001",
    name: "Duzie Ikwuegbu",
    email: "duzie.ikwuegbu@ddblagos.com",
    gameTitle: "Crisis comms - Round 4",
    tokenCount: 12400,
    aiScore: 82,
    status: "pending",
  },
  {
    id: "sub-002",
    name: "Stephen Ifebajo",
    email: `stephen.ifebajo@${allowedEmailDomain}`,
    gameTitle: "Crisis comms - Round 4",
    tokenCount: 15880,
    aiScore: 78,
    status: "needs-review",
  },
  {
    id: "sub-003",
    name: "Tolulope Badamassi",
    email: "tolulope.badamassi@casersgroup.com",
    gameTitle: "Campaign concept - Round 3",
    tokenCount: 18340,
    aiScore: 95,
    status: "approved",
  },
];
