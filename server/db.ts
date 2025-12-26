import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Em produção (Vercel), DATABASE_URL é obrigatório
if (import.meta.env.PROD && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in production. Did you forget to provision a database?");
}

// Em desenvolvimento local, avisa mas não quebra (útil para testar frontend/MiniKit sem DB)
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL não definida – rodando sem conexão ao banco (modo dev/frontend only)");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost/postgres", // fallback inofensivo
});

export const db = drizzle(pool, { schema });