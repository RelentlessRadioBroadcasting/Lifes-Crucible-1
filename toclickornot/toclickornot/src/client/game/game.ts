import {
  InitResponse,
  ClickResponse,
  RestartResponse,
  Stats,
  GameState,
  Situation,
} from "../../shared/types/api";

const turnDisplay = document.getElementById("turn-display") as HTMLDivElement;
const situationText = document.getElementById("situation-text") as HTMLParagraphElement;
const clickCount = document.getElementById("click-count") as HTMLSpanElement;
const clicksNeeded = document.getElementById("clicks-needed") as HTMLSpanElement;
const surviveButton = document.getElementById("survive-button") as HTMLButtonElement;
const gameOverScreen = document.getElementById("game-over-screen") as HTMLDivElement;
const gameOverIcon = document.getElementById("game-over-icon") as HTMLDivElement;
const gameOverTitle = document.getElementById("game-over-title") as HTMLHeadingElement;
const gameOverMessage = document.getElementById("game-over-message") as HTMLParagraphElement;
const restartButton = document.getElementById("restart-button") as HTMLButtonElement;
const usernameDisplay = document.getElementById("username") as HTMLSpanElement;
const totalPlaysDisplay = document.getElementById("total-plays") as HTMLSpanElement;

const healthBar = document.getElementById("health-bar") as HTMLDivElement;
const sanityBar = document.getElementById("sanity-bar") as HTMLDivElement;
const hopeBar = document.getElementById("hope-bar") as HTMLDivElement;
const financialBar = document.getElementById("financial-bar") as HTMLDivElement;
const healthValue = document.getElementById("health-value") as HTMLSpanElement;
const sanityValue = document.getElementById("sanity-value") as HTMLSpanElement;
const hopeValue = document.getElementById("hope-value") as HTMLSpanElement;
const financialValue = document.getElementById("financial-value") as HTMLSpanElement;

let currentPostId: string | null = null;
let currentGameState: GameState = "PLAYING";

function updateStats(stats: Stats) {
  healthBar.style.width = `${stats.health}%`;
  sanityBar.style.width = `${stats.sanity}%`;
  hopeBar.style.width = `${stats.hope}%`;
  financialBar.style.width = `${stats.financial}%`;

  healthValue.textContent = stats.health.toString();
  sanityValue.textContent = stats.sanity.toString();
  hopeValue.textContent = stats.hope.toString();
  financialValue.textContent = stats.financial.toString();

  healthBar.classList.toggle("critical", stats.health < 20);
  sanityBar.classList.toggle("critical", stats.sanity < 20);
  hopeBar.classList.toggle("critical", stats.hope < 20);
  financialBar.classList.toggle("critical", stats.financial < 20);
}

function updateTurn(turn: number) {
  turnDisplay.textContent = `ROUND ${Math.min(turn, 10)}/10`;
}

function updateSituation(situation: Situation | null) {
  if (situation) {
    situationText.textContent = situation.message;
  } else {
    situationText.textContent = "Loading...";
  }
}

function updateClicks(clicks: number, needed: number) {
  clickCount.textContent = clicks.toString();
  clicksNeeded.textContent = needed.toString();
}

function showGameOver(state: GameState, message: string) {
  currentGameState = state;
  gameOverScreen.classList.remove("hidden");
  gameOverMessage.textContent = message;

  if (state === "VICTORY") {
    gameOverIcon.textContent = "🏆";
    gameOverTitle.textContent = "SURVIVAL COMPLETE";
    gameOverTitle.classList.add("victory");
    restartButton.classList.add("victory");
    restartButton.textContent = "PLAY AGAIN";
  } else if (state === "RUSHED") {
    gameOverIcon.textContent = "⚡";
    gameOverTitle.textContent = "LIFE SKIPPED";
    gameOverTitle.classList.remove("victory");
    restartButton.classList.remove("victory");
    restartButton.textContent = "DON'T RUSH THROUGH LIFE";
  } else {
    gameOverIcon.textContent = "💀";
    gameOverTitle.textContent = "SIMULATION FAILED";
    gameOverTitle.classList.remove("victory");
    restartButton.classList.remove("victory");
    restartButton.textContent = "REBOOT LIFE.EXE";
  }
}

function hideGameOver() {
  gameOverScreen.classList.add("hidden");
}

async function init() {
  try {
    const response = await fetch("/api/init");
    if (!response.ok) throw new Error("Init failed");
    
    const data = (await response.json()) as InitResponse;
    currentPostId = data.postId;
    currentGameState = data.gameState;
    
    usernameDisplay.textContent = data.username;
    totalPlaysDisplay.textContent = data.totalPlays.toString();
    
    updateStats(data.stats);
    updateTurn(data.turn);
    updateSituation(data.situation);
    updateClicks(0, 5);

    if (data.gameState !== "PLAYING") {
      showGameOver(data.gameState, "Resume your simulation...");
    }
  } catch (error) {
    console.error("Init error:", error);
    situationText.textContent = "Error loading game...";
  }
}

async function handleClick() {
  if (!currentPostId || currentGameState !== "PLAYING") return;

  try {
    const response = await fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) throw new Error("Click failed");

    const data = (await response.json()) as ClickResponse;
    updateClicks(data.clicks, data.clicksNeeded);

    if (data.turnComplete) {
      if (data.newStats) updateStats(data.newStats);
      if (data.newTurn) updateTurn(data.newTurn);
      if (data.newSituation) updateSituation(data.newSituation);

      if (data.gameState && data.gameState !== "PLAYING") {
        showGameOver(data.gameState, data.message || "");
      }
    }
  } catch (error) {
    console.error("Click error:", error);
  }
}

async function handleRestart() {
  try {
    const response = await fetch("/api/restart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) throw new Error("Restart failed");

    const data = (await response.json()) as RestartResponse;
    currentGameState = data.gameState;
    
    updateStats(data.stats);
    updateTurn(data.turn);
    updateSituation(data.situation);
    updateClicks(0, 5);
    hideGameOver();
  } catch (error) {
    console.error("Restart error:", error);
  }
}

surviveButton.addEventListener("click", handleClick);
restartButton.addEventListener("click", handleRestart);

init();
