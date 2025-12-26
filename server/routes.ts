import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.auth.verify.path, async (req: Request, res: Response) => {
    try {
      const { payload } = req.body;
      
      let worldId: string;
      
      if (payload && payload.nullifier_hash) {
        worldId = payload.nullifier_hash;
      } else {
        worldId = "user_" + req.sessionID.substring(0, 12);
      }
      
      let user = await storage.getUserByWorldId(worldId);
      if (!user) {
        user = await storage.createUser({ 
          worldId,
          username: "Miner_" + worldId.substring(0, 8)
        });
      }
      
      req.session.userId = user.id;
      req.session.worldId = worldId;
      
      res.json(user);
    } catch (err) {
      console.error("Verification error:", err);
      res.status(400).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth-verify", async (req: Request, res: Response) => {
    try {
      const { payload } = req.body;
      
      if (!payload || !payload.nullifier_hash) {
        return res.status(400).json({ success: false, error: "Invalid payload" });
      }
      
      const worldId = payload.nullifier_hash;
      
      let user = await storage.getUserByWorldId(worldId);
      if (!user) {
        user = await storage.createUser({ 
          worldId,
          username: "Miner_" + worldId.substring(0, 8)
        });
      }
      
      req.session.userId = user.id;
      req.session.worldId = worldId;
      
      res.json({ success: true, user });
    } catch (err) {
      console.error("Auth verify error:", err);
      res.status(400).json({ success: false, error: "Verification failed" });
    }
  });

  app.get("/api/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      worldId: user.worldId,
      username: user.username,
      minedBalance: user.minedBalance,
      membership: user.membership,
      lastMineTime: user.lastMineTime,
      nextMineTime: user.nextMineTime,
    });
  });

  app.get(api.user.get.path, async (req: Request, res: Response) => {
    const user = await storage.getUserByWorldId(req.params.worldId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.post("/api/membership/:membership", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { membership } = req.params;
      const validMemberships = ["free", "vip", "silver", "gold", "platinum"];
      
      if (!validMemberships.includes(membership)) {
        return res.status(400).json({ message: "Invalid membership type" });
      }

      const currentUser = await storage.getUserById(req.session.userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const tierOrder = ["free", "vip", "silver", "gold", "platinum"];
      const currentTierIndex = tierOrder.indexOf(currentUser.membership || "free");
      const newTierIndex = tierOrder.indexOf(membership);

      if (newTierIndex <= currentTierIndex && membership !== "free") {
        return res.status(400).json({ message: "Can only upgrade to higher tiers" });
      }

      const updatedUser = await storage.updateMembership(req.session.userId, membership);
      res.json({ success: true, membership: updatedUser.membership, user: updatedUser });
    } catch (err) {
      console.error("Membership error:", err);
      res.status(500).json({ message: "Failed to update membership" });
    }
  });

  app.post(api.mining.claim.path, async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { amount } = api.mining.claim.input.parse(req.body);
      
      const userRecord = await storage.getUserById(req.session.userId);
      if (!userRecord) {
        return res.status(404).json({ message: "User not found" });
      }

      const now = new Date();
      const nextMineTime = userRecord.nextMineTime ? new Date(userRecord.nextMineTime) : new Date(0);
      
      if (now < nextMineTime) {
        const secondsUntilMine = Math.ceil((nextMineTime.getTime() - now.getTime()) / 1000);
        return res.status(400).json({ 
          message: "Mining on cooldown",
          secondsUntilMine,
          nextMineTime: nextMineTime.toISOString()
        });
      }

      const updatedUser = await storage.updateBalance(req.session.userId, amount);
      res.json({ success: true, newBalance: updatedUser.minedBalance || 0, nextMineTime: updatedUser.nextMineTime });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Mining error:", err);
      res.status(500).json({ message: "Mining failed" });
    }
  });

  const balanceSchema = z.object({
    amount: z.number().positive("Amount must be positive"),
  });

  app.post("/api/balance/add", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { amount } = balanceSchema.parse(req.body);
      
      const updatedUser = await storage.addToBalance(req.session.userId, amount);
      res.json({ success: true, newBalance: updatedUser.minedBalance || 0 });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Balance add error:", err);
      res.status(500).json({ message: "Failed to add balance" });
    }
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.json({ success: true });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });

  return httpServer;
}
