import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScoreSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/scores", async (_req, res) => {
    try {
      const topScores = await storage.getTopScores(10);
      res.json(topScores);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });

  app.post("/api/scores", async (req, res) => {
    try {
      const parsed = insertScoreSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid score data" });
      }
      const score = await storage.createScore(parsed.data);
      res.json(score);
    } catch (e) {
      res.status(500).json({ message: "Failed to save score" });
    }
  });

  return httpServer;
}
