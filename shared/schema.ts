import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  worldId: text("world_id").unique(), // From MiniKit
  username: text("username"),
  minedBalance: integer("mined_balance").default(0),
  lastMineTime: timestamp("last_mine_time").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, minedBalance: true, lastMineTime: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Mining claim request
export const mineSchema = z.object({
  amount: z.number().min(1),
});
export type MineRequest = z.infer<typeof mineSchema>;

export const verifySchema = z.object({
  payload: z.any(), // World ID proof payload
  action: z.string(),
});
export type VerifyRequest = z.infer<typeof verifySchema>;
