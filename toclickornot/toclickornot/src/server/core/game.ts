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

// Core 5 repeatable situations (can appear multiple times in a game)
const CORE_SITUATIONS = [
  "You get a notification that you have a meeting in 5 minutes.",
  "Your friend texts you a meme that actually made you laugh.",
  "You spill coffee on your shirt right before work.",
  "Someone compliments your work unexpectedly.",
  "You realize you forgot to respond to an important email."
];

// Situation templates for random generation
const SITUATION_TEMPLATES = [
  "Your boss nitpicks something trivial you did.",
  "You find money in an old jacket pocket.",
  "You're stuck in traffic and late for something important.",
  "You make someone smile with a kind gesture.",
  "Your alarm didn't go off and you overslept.",
  "You remember something embarrassing you did years ago.",
  "A loved one tells you they're proud of you.",
  "You receive an unexpected bill in the mail.",
  "You finally finish a task you've been procrastinating on.",
  "You catch yourself in the mirror and don't recognize yourself.",
  "A stranger holds the door for you.",
  "You eat something delicious and savor every bite.",
  "Your anxiety spirals about something you can't control.",
  "You have a moment of pure clarity about what matters.",
  "Someone took credit for your work.",
  "You laughed until your sides hurt.",
  "The weight of your responsibilities feels crushing.",
  "You helped someone without being asked.",
  "You made a silly mistake that everyone witnessed.",
  "You felt genuinely safe and at peace.",
  "Your body aches from stress.",
  "You had a conversation that changed your perspective.",
  "You failed at something you really wanted to succeed at.",
  "You received unexpected kindness from a stranger.",
  "You wasted the entire evening and feel guilty.",
  "You stood up for yourself for once.",
  "You felt completely invisible.",
  "You made someone laugh until they cried.",
  "You couldn't afford something you really needed.",
  "You reconnected with an old friend.",
  "You caught a cold from your coworker.",
  "Found $20 on the ground!",
  "Your landlord raised the rent.",
  "A stranger smiled at you today.",
  "You stayed up doom-scrolling until 3am.",
  "Your best friend moved away.",
  "You got a promotion at work!",
  "Food poisoning from gas station sushi.",
  "Your therapist went on vacation.",
  "You won a small lottery prize!",
  "Your car broke down.",
  "A dog ran up and licked your face.",
  "You burnt your dinner again.",
  "Your ex texted you at 2am.",
  "You finished reading a good book.",
  "Your credit card got declined.",
  "You went for a nice walk.",
  "Your WiFi went out during important work.",
  "You got a compliment from a stranger.",
  "Stepped on a LEGO.",
  "You accidentally liked your ex's old photo.",
  "Your plant is still alive!",
  "You lost your wallet.",
  "A bird pooped on you. Lucky?",
  "You had a really good nap.",
];

// Function to generate random stat changes
function generateRandomStatChange(): Partial<Stats> {
  const stats: (keyof Stats)[] = ["health", "sanity", "hope", "financial"];
  const change: Partial<Stats> = {};
  
  // Generate 1-3 stat changes
  const numChanges = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...stats].sort(() => Math.random() - 0.5);
  const selectedStats = shuffled.slice(0, numChanges);
  
  selectedStats.forEach(stat => {
    const isPositive = Math.random() > 0.4; // 60% chance positive
    if (isPositive) {
      // Positive: 2-7 points
      change[stat] = Math.floor(Math.random() * 6) + 2;
    } else {
      // Negative: -4 to -10 points
      change[stat] = -(Math.floor(Math.random() * 7) + 4);
    }
  });
  
  return change;
}

export function getRandomSituation(): Situation {
  // 25% chance to use core situation, 75% chance for template
  const useCore = Math.random() < 0.25;
  
  let message: string;
  if (useCore) {
    const idx = Math.floor(Math.random() * CORE_SITUATIONS.length);
    message = CORE_SITUATIONS[idx]!;
  } else {
    const idx = Math.floor(Math.random() * SITUATION_TEMPLATES.length);
    message = SITUATION_TEMPLATES[idx]!;
  }
  
  return {
    message,
    effects: generateRandomStatChange(),
  };
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
    "You navigated the chaos. The simulation acknowledges your persistence.",
    "LIFE.EXE completed without fatal errors. Impressive.",
  ];
  const idx = Math.floor(Math.random() * messages.length);
  return messages[idx]!;
}

export const ROUND_EVENTS = [
  "You made it through another day.",
  "The weight of existence feels heavier than usual.",
  "You feel more human today than yesterday.",
  "Everything feels pointless.",
  "You had moments of genuine connection.",
  "Fatigue is setting in.",
  "Time moves strangely today.",
  "You're still here. That counts for something.",
];

export function getRandomRoundEvent(): string {
  const idx = Math.floor(Math.random() * ROUND_EVENTS.length);
  return ROUND_EVENTS[idx]!;
}
