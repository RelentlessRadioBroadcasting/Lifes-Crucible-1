import { Stats, Situation } from "../../shared/types/api";

export const MAX_TURNS = 10;
export const CLICKS_PER_TURN = 5;
export const SPAM_THRESHOLD_MS = 100;

export const INITIAL_STATS: Stats = {
  health: 50,
  sanity: 50,
  hope: 50,
  financial: 50,
};

const SITUATIONS: Situation[] = [
  { message: "You caught a cold from your coworker.", effects: { health: -15 } },
  { message: "Found $20 on the ground!", effects: { financial: 10, hope: 5 } },
  { message: "Your landlord raised the rent.", effects: { financial: -20, sanity: -10 } },
  { message: "A stranger smiled at you today.", effects: { hope: 10, sanity: 5 } },
  { message: "You stayed up doom-scrolling until 3am.", effects: { health: -10, sanity: -15 } },
  { message: "Your best friend moved away.", effects: { hope: -15, sanity: -10 } },
  { message: "You got a promotion at work!", effects: { financial: 25, hope: 15 } },
  { message: "Food poisoning from gas station sushi.", effects: { health: -25, financial: -10 } },
  { message: "Your therapist went on vacation.", effects: { sanity: -20 } },
  { message: "You won a small lottery prize!", effects: { financial: 30, hope: 20 } },
  { message: "Your car broke down.", effects: { financial: -30, sanity: -15 } },
  { message: "A dog ran up and licked your face.", effects: { hope: 15, health: 5 } },
  { message: "You burnt your dinner again.", effects: { sanity: -5, financial: -5 } },
  { message: "Your ex texted you at 2am.", effects: { sanity: -20, hope: -10 } },
  { message: "You finished reading a good book.", effects: { sanity: 15, hope: 10 } },
  { message: "Your credit card got declined.", effects: { financial: -15, sanity: -15, hope: -10 } },
  { message: "You went for a nice walk.", effects: { health: 10, sanity: 10 } },
  { message: "Your WiFi went out during important work.", effects: { sanity: -25, financial: -10 } },
  { message: "You got a compliment from a stranger.", effects: { hope: 15, sanity: 10 } },
  { message: "Stepped on a LEGO.", effects: { health: -5, sanity: -10 } },
  { message: "You accidentally liked your ex's old photo.", effects: { sanity: -30, hope: -15 } },
  { message: "Your plant is still alive!", effects: { hope: 10, sanity: 5 } },
  { message: "You lost your wallet.", effects: { financial: -25, sanity: -20 } },
  { message: "A bird pooped on you. Lucky?", effects: { hope: -5, sanity: -5 } },
  { message: "You had a really good nap.", effects: { health: 15, sanity: 15 } },
];

export function getRandomSituation(): Situation {
  const idx = Math.floor(Math.random() * SITUATIONS.length);
  return SITUATIONS[idx]!;
}

export function applyEffects(stats: Stats, effects: Partial<Stats>): Stats {
  return {
    health: Math.max(0, Math.min(100, stats.health + (effects.health || 0))),
    sanity: Math.max(0, Math.min(100, stats.sanity + (effects.sanity || 0))),
    hope: Math.max(0, Math.min(100, stats.hope + (effects.hope || 0))),
    financial: Math.max(0, Math.min(100, stats.financial + (effects.financial || 0))),
  };
}

export function checkGameOver(stats: Stats): string | null {
  if (stats.health <= 0) return "Your body gave out. SYSTEM FAILURE.";
  if (stats.sanity <= 0) return "Reality became too much. MIND OVERFLOW.";
  if (stats.hope <= 0) return "The void consumed you. HOPE.EXE NOT FOUND.";
  if (stats.financial <= 0) return "Bankruptcy complete. WALLET CORRUPTED.";
  return null;
}

export function getVictoryMessage(): string {
  const messages = [
    "Against all odds, you survived. But at what cost?",
    "You made it. The simulation is complete... for now.",
    "SURVIVAL VERIFIED. You are a statistical anomaly.",
    "10 rounds survived. Your resilience is... noted.",
  ];
  const idx = Math.floor(Math.random() * messages.length);
  return messages[idx]!;
}
