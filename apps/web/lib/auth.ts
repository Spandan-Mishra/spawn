import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@repo/db";
import { db } from "@repo/db";
import { betterAuth } from "better-auth"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }
    }
})