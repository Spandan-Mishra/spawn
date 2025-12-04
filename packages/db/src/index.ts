import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { users, projects, messages, files, usersRelations, projectsRelations, messagesRelations, filesRelations } from "./schema";
import { eq } from "drizzle-orm";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, { schema: { users, projects, messages, files, usersRelations, projectsRelations, messagesRelations, filesRelations } });

export { users, projects, messages, files, usersRelations, projectsRelations, messagesRelations, filesRelations };

export { eq };