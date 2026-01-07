import express from "express";
import {
  InitResponse,
  ClickResponse,
  RestartResponse,
  LeaderboardResponse,
  SubmitScoreResponse,
  Stats,
  GameState,
} from "../shared/types/api";
import {
  createServer,
  context,
  getServerPort,
  reddit,
  redis,
} from "@devvit/web/server";
import { createPost } from "./core/post";
import {
  MAX_TURNS,
  CLICKS_PER_TURN,
  SPAM_THRESHOLD_MS,
  INITIAL_STATS,
  getRandomSituation,
  applyEffects,
  checkGameOver,
  getVictoryMessage,
} from "./core/game";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const router = express.Router();

// Helper to get user-specific keys
function userKey(postId: string, username: string, key: string): string {
  return `${postId}:${username}:${key}`;
}

router.get<
  { postId: string },
  InitResponse | { status: string; message: string }
>("/api/init", async (_req, res): Promise<void> => {
  const { postId } = context;

  if (!postId) {
    res.status(400).json({ status: "error", message: "postId is required" });
    return;
  }

  try {
    const username = (await reddit.getCurrentUsername()) ?? "anonymous";
    
    // Get or initialize game state for this user
    const gameStateStr = await redis.get(userKey(postId, username, "gameState"));
    const turnStr = await redis.get(userKey(postId, username, "turn"));
    const statsStr = await redis.get(userKey(postId, username, "stats"));
    const situationStr = await redis.get(userKey(postId, username, "situation"));
    
    // Get global stats
    const highScoreStr = await redis.get(`${postId}:highScore`);
    const totalPlaysStr = await redis.get(`${postId}:totalPlays`);

    let gameState: GameState = (gameStateStr as GameState) || "PLAYING";
    let turn = turnStr ? parseInt(turnStr) : 1;
    let stats: Stats = statsStr ? JSON.parse(statsStr) : { ...INITIAL_STATS };
    let situation = situationStr ? JSON.parse(situationStr) : null;

    // If new game, generate first situation
    if (!situationStr && gameState === "PLAYING") {
      situation = getRandomSituation();
      await redis.set(userKey(postId, username, "situation"), JSON.stringify(situation));
      await redis.set(userKey(postId, username, "turn"), "1");
      await redis.set(userKey(postId, username, "stats"), JSON.stringify(stats));
      await redis.set(userKey(postId, username, "gameState"), "PLAYING");
      await redis.set(userKey(postId, username, "clicks"), "0");
    }

    res.json({
      type: "init",
      postId,
      username,
      gameState,
      turn,
      stats,
      situation,
      highScore: highScoreStr ? parseInt(highScoreStr) : 0,
      totalPlays: totalPlaysStr ? parseInt(totalPlaysStr) : 0,
    });
  } catch (error) {
    console.error(`API Init Error:`, error);
    res.status(400).json({ status: "error", message: "Initialization failed" });
  }
});

router.post<
  { postId: string },
  ClickResponse | { status: string; message: string }
>("/api/click", async (_req, res): Promise<void> => {
  const { postId } = context;

  if (!postId) {
    res.status(400).json({ status: "error", message: "postId is required" });
    return;
  }

  try {
    const username = (await reddit.getCurrentUsername()) ?? "anonymous";
    
    // Check spam
    const lastClickStr = await redis.get(userKey(postId, username, "lastClick"));
    const now = Date.now();
    if (lastClickStr && now - parseInt(lastClickStr) < SPAM_THRESHOLD_MS) {
      // Spam detected - end game
      await redis.set(userKey(postId, username, "gameState"), "RUSHED");
      res.json({
        type: "click",
        postId,
        clicks: 0,
        clicksNeeded: CLICKS_PER_TURN,
        turnComplete: false,
        gameState: "RUSHED",
        message: "You rushed through life too fast. Slow down next time.",
      });
      return;
    }
    await redis.set(userKey(postId, username, "lastClick"), now.toString());

    // Get current state
    const gameStateStr = await redis.get(userKey(postId, username, "gameState"));
    if (gameStateStr !== "PLAYING") {
      res.status(400).json({ status: "error", message: "Game is not active" });
      return;
    }

    const clicksStr = await redis.get(userKey(postId, username, "clicks"));
    let clicks = clicksStr ? parseInt(clicksStr) : 0;
    clicks++;
    await redis.set(userKey(postId, username, "clicks"), clicks.toString());

    if (clicks < CLICKS_PER_TURN) {
      res.json({
        type: "click",
        postId,
        clicks,
        clicksNeeded: CLICKS_PER_TURN,
        turnComplete: false,
      });
      return;
    }

    // Turn complete - apply effects
    await redis.set(userKey(postId, username, "clicks"), "0");
    
    const statsStr = await redis.get(userKey(postId, username, "stats"));
    const situationStr = await redis.get(userKey(postId, username, "situation"));
    const turnStr = await redis.get(userKey(postId, username, "turn"));
    
    let stats: Stats = statsStr ? JSON.parse(statsStr) : { ...INITIAL_STATS };
    const situation = situationStr ? JSON.parse(situationStr) : getRandomSituation();
    let turn = turnStr ? parseInt(turnStr) : 1;

    // Apply situation effects
    stats = applyEffects(stats, situation.effects);
    await redis.set(userKey(postId, username, "stats"), JSON.stringify(stats));

    // Check for game over
    const gameOverMessage = checkGameOver(stats);
    if (gameOverMessage) {
      await redis.set(userKey(postId, username, "gameState"), "GAME_OVER");
      res.json({
        type: "click",
        postId,
        clicks: 0,
        clicksNeeded: CLICKS_PER_TURN,
        turnComplete: true,
        newStats: stats,
        gameState: "GAME_OVER",
        message: gameOverMessage,
      });
      return;
    }

    // Advance turn
    turn++;
    await redis.set(userKey(postId, username, "turn"), turn.toString());

    // Check for victory
    if (turn > MAX_TURNS) {
      await redis.set(userKey(postId, username, "gameState"), "VICTORY");
      res.json({
        type: "click",
        postId,
        clicks: 0,
        clicksNeeded: CLICKS_PER_TURN,
        turnComplete: true,
        newTurn: turn,
        newStats: stats,
        gameState: "VICTORY",
        message: getVictoryMessage(),
      });
      return;
    }

    // Generate new situation
    const newSituation = getRandomSituation();
    await redis.set(userKey(postId, username, "situation"), JSON.stringify(newSituation));

    res.json({
      type: "click",
      postId,
      clicks: 0,
      clicksNeeded: CLICKS_PER_TURN,
      turnComplete: true,
      newTurn: turn,
      newSituation,
      newStats: stats,
      gameState: "PLAYING",
    });
  } catch (error) {
    console.error(`Click Error:`, error);
    res.status(400).json({ status: "error", message: "Click failed" });
  }
});

router.post<
  { postId: string },
  RestartResponse | { status: string; message: string }
>("/api/restart", async (_req, res): Promise<void> => {
  const { postId } = context;

  if (!postId) {
    res.status(400).json({ status: "error", message: "postId is required" });
    return;
  }

  try {
    const username = (await reddit.getCurrentUsername()) ?? "anonymous";
    
    const stats = { ...INITIAL_STATS };
    const situation = getRandomSituation();
    
    await redis.set(userKey(postId, username, "gameState"), "PLAYING");
    await redis.set(userKey(postId, username, "turn"), "1");
    await redis.set(userKey(postId, username, "stats"), JSON.stringify(stats));
    await redis.set(userKey(postId, username, "situation"), JSON.stringify(situation));
    await redis.set(userKey(postId, username, "clicks"), "0");

    // Increment total plays
    await redis.incrBy(`${postId}:totalPlays`, 1);

    res.json({
      type: "restart",
      postId,
      turn: 1,
      stats,
      situation,
      gameState: "PLAYING",
    });
  } catch (error) {
    console.error(`Restart Error:`, error);
    res.status(400).json({ status: "error", message: "Restart failed" });
  }
});

router.post<
  { postId: string },
  SubmitScoreResponse | { status: string; message: string }
>("/api/submit-score", async (_req, res): Promise<void> => {
  const { postId } = context;

  if (!postId) {
    res.status(400).json({ status: "error", message: "postId is required" });
    return;
  }

  try {
    const username = (await reddit.getCurrentUsername()) ?? "anonymous";
    const turnStr = await redis.get(userKey(postId, username, "turn"));
    const gameStateStr = await redis.get(userKey(postId, username, "gameState"));
    
    const turn = turnStr ? parseInt(turnStr) : 1;
    const roundsSurvived = gameStateStr === "VICTORY" ? MAX_TURNS : Math.max(0, turn - 1);

    // Add to leaderboard
    const score = roundsSurvived * 1000 + Date.now() % 1000;
    await redis.zAdd(`${postId}:leaderboard`, { member: `${username}:${Date.now()}`, score });

    // Update high score
    const highScoreStr = await redis.get(`${postId}:highScore`);
    const highScore = highScoreStr ? parseInt(highScoreStr) : 0;
    if (roundsSurvived > highScore) {
      await redis.set(`${postId}:highScore`, roundsSurvived.toString());
    }

    res.json({
      type: "submit",
      success: true,
    });
  } catch (error) {
    console.error(`Submit Score Error:`, error);
    res.status(400).json({ status: "error", message: "Submit failed" });
  }
});

router.get<
  { postId: string },
  LeaderboardResponse | { status: string; message: string }
>("/api/leaderboard", async (_req, res): Promise<void> => {
  const { postId } = context;

  if (!postId) {
    res.status(400).json({ status: "error", message: "postId is required" });
    return;
  }

  try {
    const entries = await redis.zRange(`${postId}:leaderboard`, 0, 9, { by: "rank", reverse: true });
    
    const leaderboard = entries.map((entry) => {
      const parts = entry.member.split(":");
      const username = parts[0] || "anonymous";
      const timestamp = parts[1] ? parseInt(parts[1]) : Date.now();
      return {
        username,
        roundsSurvived: Math.floor(entry.score / 1000),
        timestamp,
      };
    });

    res.json({
      type: "leaderboard",
      entries: leaderboard,
    });
  } catch (error) {
    console.error(`Leaderboard Error:`, error);
    res.status(400).json({ status: "error", message: "Leaderboard failed" });
  }
});

router.post("/internal/on-app-install", async (_req, res): Promise<void> => {
  try {
    const post = await createPost();
    res.json({
      status: "success",
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({ status: "error", message: "Failed to create post" });
  }
});

router.post("/internal/menu/post-create", async (_req, res): Promise<void> => {
  try {
    const post = await createPost();
    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({ status: "error", message: "Failed to create post" });
  }
});

app.use(router);

const server = createServer(app);
server.on("error", (err) => console.error(`server error; ${err.stack}`));
server.listen(getServerPort());
