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

  app.post(api.mining.claim.path, async (req, res) => {
    // In a real app, check session
    // For demo, we might need to pass userId or use the one we just "logged in" with
    // But since this is stateless, let's rely on the frontend passing a user ID or just fail if no auth
    
    // Simplification: Allow claiming for any user ID passed in headers or body? 
    // Let's assume the frontend sends the worldId in a header for this MVP
    
    // Actually, to keep it simple for the MVP without complex auth:
    // We will just seed a default user on startup and always use that user for the demo
    // OR, we expect the frontend to pass the ID.
    
    // Let's implement a "demo mode" claim that works for the most recently created user
    // This is hacky but fits "lite build" where we skip full auth implementation details
    
    if (!currentUserId) {
       // fallback: find any user
       const user = await storage.createUser({ worldId: "demo_user", username: "DemoMiner" }).catch(() => storage.getUserByWorldId("demo_user"));
       if (user) currentUserId = user.id;
    }
    
    if (!currentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const { amount } = req.body;
    const updatedUser = await storage.updateBalance(currentUserId, amount);
    res.json({ success: true, newBalance: updatedUser.minedBalance || 0 });
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
