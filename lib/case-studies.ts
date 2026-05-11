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
    title: "BBDO West Africa",
    solution: "Opportunity Creation",
    arena: "Creative & Agency Operations",
    lede:
      "We had the talent. We had no way to prove it was ready for what AI was changing.",
    client: {
      name: "BBDO West Africa",
      description:
        "One of West Africa's leading creative agencies, operating across Lagos and regional markets, looking to build a measurable edge in AI-assisted creative production before the capability gap became a competitive liability.",
    },
    problem:
      "BBDO West Africa's creative teams had strong instincts but no structured way to develop or demonstrate AI fluency. Passive training sessions weren't building transferable skills. Capability existed in pockets — individual practitioners experimenting on their own — but there was no shared standard, no visibility into who was progressing, and no mechanism to close the gap at scale. The agency needed a way to make AI-assisted creative work learnable, measurable, and competitive without disrupting the existing culture of craft.",
    phases: [
      {
        title: "Architect",
        body: "Mapped the distance between the agency's existing creative workflow and the demands of AI-augmented output. Defined a five-dimension scoring rubric — strategic clarity, creative quality, token efficiency, craft, and innovation — that could evaluate AI-assisted work on the same terms as traditional creative production. Designed a challenge format built around real client brief archetypes, with a token budget constraint that forced intentional, efficient thinking rather than exploratory sprawl.",
      },
      {
        title: "Assemble",
        body: "Brought together a pod of creative directors, strategists, and platform engineers to build and validate the system. Creative leadership stress-tested the brief library against live account scenarios to ensure fidelity. Technologists built the scoring engine, leaderboard infrastructure, and submission pipeline on a tight timeline. Domain leads from three agency units — BBDO West Africa, DDB Lagos, and Casers Group — were embedded as beta players to pressure-test the rubric before wider rollout.",
      },
      {
        title: "Operate",
        body: "Launched weilquest as a live, rolling challenge platform across three agency divisions over twelve weeks. Players received timed briefs, submitted AI-assisted responses within a 1,000-token budget, and received scored feedback across all five dimensions. Brief difficulty was iterated week-over-week based on aggregate submission data — harder constraints where scores plateaued, more open prompts where participation dropped. Leaderboard rankings were surfaced in real time, making individual and team progress visible without requiring external coaching or facilitation.",
      },
    ],
    outcome: {
      summary:
        "BBDO West Africa left with a functioning internal platform, a measurable baseline for AI creative fluency across three divisions, and a repeatable challenge format they own — without a retraining mandate or ongoing consultant dependency.",
      stats: [
        { value: "+41%", label: "avg score improvement, Week 1 to Week 8" },
        { value: "<8wk", label: "concept to live platform" },
        { value: "92%", label: "player retention across 12-week cycle" },
        { value: "3 units", label: "agency divisions active on launch week" },
      ],
    },
  },
];
