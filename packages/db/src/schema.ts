import { relations } from "drizzle-orm";
import { pgEnum, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const role = pgEnum("role", ["user", "assistant"]);
export const messageType = pgEnum("message_type", ["text", "tool_call"]);

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const projects = pgTable("projects", {
    id: uuid("id").defaultRandom().primaryKey(),
    description: text("description"),
    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content").notNull(),
    role: role("role").notNull(),
    type: messageType("type").notNull(),
    projectId: uuid("project_id")
        .references(() => projects.id)
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const files = pgTable("files", {
    id: uuid("id").defaultRandom().primaryKey(),
    path: text("path").notNull(),
    content: text("content"),
    projectId: uuid("project_id")
        .references(() => projects.id)
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (f) => ({
        uniquePathPerProject: unique("unique_path_per_project").on(f.projectId, f.path)
    })
)

export const usersRelations = relations(users, ({ many }) => ({
    projects: many(projects)
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
    users: one(users, {
        fields: [projects.userId],
        references: [users.id]
    }),
    files: many(files),
    messages: many(messages)
}))

export const messagesRelations = relations(messages, ({ one }) => ({
    projects: one(projects, {
        fields: [messages.projectId],
        references: [projects.id]
    })
}))

export const filesRelations = relations(files, ({ one }) => ({
    projects: one(projects, {
        fields: [files.projectId],
        references: [projects.id]
    })
}))