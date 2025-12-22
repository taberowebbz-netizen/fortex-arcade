import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Mock current user middleware for this demo (since we don't have full auth session)
  // In a real app, we'd use a session or JWT from the verify endpoint
  let currentUserId: number | null = null;

  app.post(api.auth.verify.path, async (req, res) => {
    try {
      // In a real app, verify the proof with Worldcoin API here
      // const { payload, action } = req.body;
      // const verifyRes = await fetch(...)
      
      // For now, we assume success and use a mock world_id derived or passed (simplified)
      // Actually, let's just create a mock user if one doesn't exist for "demo_user"
      // Or better, let the frontend send a specific ID or we generate one
      
      // MOCK: Create/Get a user based on a consistent ID for demo purposes
      const mockWorldId = "user_" + Math.random().toString(36).substring(7);
      
      let user = await storage.getUserByWorldId(mockWorldId);
      if (!user) {
        user = await storage.createUser({ 
          worldId: mockWorldId,
          username: "Miner_" + Math.random().toString(36).substring(7)
        });
      }
      
      currentUserId = user.id; // Store in closure for demo (not safe for prod, use sessions)
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: "Verification failed" });
    }
  });

  app.get(api.user.get.path, async (req, res) => {
    const user = await storage.getUserByWorldId(req.params.worldId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.post("/api/membership/:membership", async (req, res) => {
    if (!currentUserId) {
      const user = await storage.createUser({ worldId: "demo_user", username: "DemoMiner" }).catch(() => storage.getUserByWorldId("demo_user"));
      if (user) currentUserId = user.id;
    }

    if (!currentUserId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { membership } = req.params;
      const validMemberships = ["free", "vip", "silver", "gold", "platinum"];
      
      if (!validMemberships.includes(membership)) {
        return res.status(400).json({ message: "Invalid membership type" });
      }

      const updatedUser = await storage.updateMembership(currentUserId, membership);
      res.json({ success: true, membership: updatedUser.membership });
    } catch (err) {
      res.status(500).json({ message: "Failed to update membership" });
    }
  });

  app.post(api.mining.claim.path, async (req, res) => {
    if (!currentUserId) {
       // fallback: find or create demo user
       const user = await storage.createUser({ worldId: "demo_user", username: "DemoMiner" }).catch(() => storage.getUserByWorldId("demo_user"));
       if (user) currentUserId = user.id;
    }
    
    if (!currentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { amount } = api.mining.claim.input.parse(req.body);
      
      // Get current user to check cooldown
      const userRecord = await storage.getUserByWorldId("demo_user");
      if (!userRecord) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if 24h cooldown has passed
      const now = new Date();
      const nextMineTime = new Date(userRecord.nextMineTime);
      
      if (now < nextMineTime) {
        const secondsUntilMine = Math.ceil((nextMineTime.getTime() - now.getTime()) / 1000);
        return res.status(400).json({ 
          message: "Mining on cooldown",
          secondsUntilMine,
          nextMineTime: nextMineTime.toISOString()
        });
      }

      const updatedUser = await storage.updateBalance(currentUserId, amount);
      res.json({ success: true, newBalance: updatedUser.minedBalance || 0, nextMineTime: updatedUser.nextMineTime });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post("/api/balance/add", async (req, res) => {
    if (!currentUserId) {
      // fallback: find or create demo user
      const user = await storage.createUser({ worldId: "demo_user", username: "DemoMiner" }).catch(() => storage.getUserByWorldId("demo_user"));
      if (user) currentUserId = user.id;
    }

    if (!currentUserId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { amount } = req.body;
      
      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const updatedUser = await storage.updateBalance(currentUserId, amount);
      res.json({ success: true, newBalance: updatedUser.minedBalance || 0 });
    } catch (err) {
      res.status(500).json({ message: "Failed to add balance" });
    }
  });

  // Seed default user
  const existing = await storage.getUserByWorldId("demo_user");
  if (!existing) {
    await storage.createUser({
      worldId: "demo_user",
      username: "Demo Miner",
    });
  }

  return httpServer;
}
