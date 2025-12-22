import { db } from "./db";
import { users, type User, type InsertUser } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUserByWorldId(worldId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateBalance(userId: number, amount: number): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getUserByWorldId(worldId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.worldId, worldId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateBalance(userId: number, amount: number): Promise<User> {
    const nextMineTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const [user] = await db
      .update(users)
      .set({ 
        minedBalance: sql`${users.minedBalance} + ${amount}`,
        lastMineTime: new Date(),
        nextMineTime
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
