import express from "express";
import "dotenv/config";
import { db, projects, files, eq, users } from "@repo/db";
import { BASE_TEMPLATE } from "./base-template";
import createSandbox from "./services/sandbox";

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        const [user] = await db.insert(users).values({
            username,
            password
        }).returning();

        res.json({ userId: user.id });
    } catch (error) {
        console.error(error);
        res.json({error})
    }
})

app.post("/project", async (req, res) => {
    const { prompt, userId } = req.body;

    await db.transaction(async (tx) => {
        const [project] = await tx.insert(projects).values({
            userId,
            description: prompt
        }).returning();

        const fileRows = Object.entries(BASE_TEMPLATE).map(([path, content]) => ({
            path,
            content,
            projectId: project.id
        }));

        await tx.insert(files).values(fileRows);

        res.json({ projectId: project.id });
    })
})

app.post("/project/:projectId/startSandbox", async (req, res) => {
    const { projectId } = req.params;
    
    const publicUrl = await createSandbox({ projectId });
    
    res.json({ publicUrl });
})

app.get("/project/:projectId/files", async (req, res) => {
    const { projectId } = req.params;

    const filesToDisplay = await db.select({
        path: files.path,
        content: files.content
    }).from(files).where(eq(files.projectId, projectId));

    res.json({ files: filesToDisplay});
})

app.listen(3001, () => {
    console.log("Spawn Backend started on port 3001");
})