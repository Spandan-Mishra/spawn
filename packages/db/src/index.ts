import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  users,
  projects,
  messages,
  files,
  usersRelations,
  projectsRelations,
  messagesRelations,
  filesRelations,
} from "./schema";

const connectionString = process.env.DATABASE_URL;

const globalForDb = globalThis as unknown as { conn: Pool | undefined };

const pool =
  globalForDb.conn ??
  new Pool({
    connectionString,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.conn = pool;

export const db = drizzle(pool, {
  schema: {
    users,
    projects,
    messages,
    files,
    usersRelations,
    projectsRelations,
    messagesRelations,
    filesRelations,
  },
});

export {
  users,
  projects,
  messages,
  files,
  usersRelations,
  projectsRelations,
  messagesRelations,
  filesRelations,
};

export { eq, and, or, not, desc, asc } from "drizzle-orm";
