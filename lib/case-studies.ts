export type CaseStudyPhase = {
  title: "Architect" | "Assemble" | "Operate";
  body: string;
};

export type CaseStudyStat = {
  value: string;
  label: string;
};

export type CaseStudy = {
  slug: string;
  number: string;
  title: string;
  solution: "Market Entry" | "Growth Stagnation" | "Opportunity Creation";
  arena: string;
  lede: string;
  client: {
    name: string;
    description: string;
  };
  problem: string;
  phases: [CaseStudyPhase, CaseStudyPhase, CaseStudyPhase];
  outcome: {
    summary: string;
    stats: [CaseStudyStat, CaseStudyStat, CaseStudyStat, CaseStudyStat];
  };
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "weilquest",
    number: "01",
    title: "weilquest",
    solution: "Opportunity Creation",
    arena: "Creative & Agency Operations",
    lede:
      "Our teams were using AI. We couldn't tell if any of it was working.",
    client: {
      name: "bbdowa",
      description:
        "A West African creative group operating across multiple agency units, looking to build genuine AI capability in their people — and a reliable way to measure whether it was actually developing.",
    },
    problem:
      "The problem wasn't access to AI tools. It was knowing how to use them well. Creatives had the tools but no benchmark for good. There was no way to separate effective AI use from noise, no shared standard for what strong output looked like, and no visibility into whether skills were improving over time. Existing training gave people information. Nothing gave them practice under pressure, scored feedback, or a reason to keep getting better.",
    phases: [
      {
        title: "Architect",
        body: "Defined the three dimensions that actually matter in AI-assisted work: productivity, creativity, and token efficiency. Built a scoring rubric across five criteria — strategic clarity, creative quality, token efficiency, craft, and innovation — that could evaluate all three from a single submission. Designed a challenge format around real brief archetypes, with a fixed token budget that made efficiency visible and comparable across every player.",
      },
      {
        title: "Assemble",
        body: "Assembled a pod of challenge designers, creative directors, and engineers to build and run the system. Challenge briefs were validated against live account scenarios to keep stakes real. Engineers shipped the scoring engine, leaderboard, and submission pipeline in parallel. Leaders from three agency units — BBDO West Africa, DDB Lagos, and Casers Group — were brought in as the first cohort to stress-test the rubric before wider rollout.",
      },
      {
        title: "Operate",
        body: "Launched weilquest as a live, rolling platform. Players received a brief, a 1,000-token budget, and a deadline. Submissions were scored across all five dimensions and ranked on a live leaderboard. Each cycle, briefs were iterated based on where scores clustered and where they stalled — harder constraints where the cohort plateaued, more open prompts where participation dropped. Players got a score, a rank, and a clear read on exactly where their AI use was strong and where it wasn't.",
      },
    ],
    outcome: {
      summary:
        "bbdowa left with a live training platform, a measurable baseline for AI skill across three agency units, and a scoring system that makes productivity, creativity, and token efficiency visible — without classroom time or passive content.",
      stats: [
        { value: "+41%", label: "avg score improvement across the first cycle" },
        { value: "3 units", label: "agency divisions scored and ranked" },
        { value: "92%", label: "player retention across a 12-week cycle" },
        { value: "1,000", label: "token budget per challenge brief" },
      ],
    },
  },
];
