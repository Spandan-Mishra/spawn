import express from "express";
import { prisma } from "@repo/db";
import { BASE_TEMPLATE } from "./base-template";
import createSandbox from "./services/sandbox";

const app = express();
app.use(express.json());

app.post("/project", async (req, res) => {
    const { prompt, userId } = req.body;
    
    await prisma.$transaction(async (tx: any) => {
        const project = await tx.project.create({
            data: {
                userId
            }
        })

        await Promise.all(Object.entries(BASE_TEMPLATE).map(async ([key, value]) => {
            await tx.file.create({
                data: {
                    path: key,
                    content: value,
                    projectId:project.id
                }
            })
        }))

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

    const files = await prisma.file.findMany({
        where: {
            projectId
        },
        select: {
            path: true,
            content: true
        }
    })

    res.json({ files });
})

app.listen(3001, () => {
    console.log("Spawn Backend started on port 3001");
})