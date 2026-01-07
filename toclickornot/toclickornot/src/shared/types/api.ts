export type Stats = {
  health: number;
  sanity: number;
  hope: number;
  financial: number;
};

export type GameState = "PLAYING" | "GAME_OVER" | "VICTORY" | "RUSHED";

export type Situation = {
  message: string;
  effects: Partial<Stats>;
};

export type InitResponse = {
  type: "init";
  postId: string;
  username: string;
  gameState: GameState;
  turn: number;
  stats: Stats;
  situation: Situation | null;
  highScore: number;
  totalPlays: number;
};

export type ClickResponse = {
  type: "click";
  postId: string;
  clicks: number;
  clicksNeeded: number;
  turnComplete: boolean;
  newTurn?: number;
  newSituation?: Situation;
  newStats?: Stats;
  gameState?: GameState;
  message?: string;
  roundEvent?: string;
};

export type RestartResponse = {
  type: "restart";
  postId: string;
  turn: number;
  stats: Stats;
  situation: Situation;
  gameState: GameState;
};

export type LeaderboardEntry = {
  username: string;
  roundsSurvived: number;
  timestamp: number;
};

export type LeaderboardResponse = {
  type: "leaderboard";
  entries: LeaderboardEntry[];
};

export type SubmitScoreResponse = {
  type: "submit";
  success: boolean;
  rank?: number;
};
