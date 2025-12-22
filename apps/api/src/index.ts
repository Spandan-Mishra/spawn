import express from "express";
import "dotenv/config";
import { db, projects, files, eq, messages, asc } from "@repo/db";
import { BASE_TEMPLATE } from "./base-template";
import createSandbox from "./services/sandbox";
import cors from "cors";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { SYSTEM_PROMPT } from "./ai/prompt";
import createAgentGraph from "./ai/graph";
import { model } from "./ai/model";
import Sandbox from "@e2b/code-interpreter";
import AdmZip from "adm-zip";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/project", async (req, res) => {
  const { prompt, userId } = req.body;

  await db.transaction(async (tx) => {
    const [project] = await tx
      .insert(projects)
      .values({
        userId,
        description: prompt,
      })
      .returning();

    const fileRows = Object.entries(BASE_TEMPLATE).map(([path, content]) => ({
      path,
      content,
      projectId: project.id,
    }));

    await tx.insert(files).values(fileRows);

    res.send({ projectId: project.id });
  });
});

app.get("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .then((r) => r[0]);

  res.json(project);
});

app.post("/project/:projectId/startSandbox", async (req, res) => {
  const { projectId } = req.params;
  const publicUrl = await createSandbox({ projectId });

  res.json(publicUrl);
});

app.post("/project/:projectId/heartbeat", async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .then((r) => r[0]);

    if (!project || !project.sandboxId) {
      throw new Error("SandboxId doesn't exist");
    }

    const sandbox = await Sandbox.connect(project.sandboxId);
    sandbox.setTimeout(5 * 60 * 1000);

    res.json(sandbox.getHost(5173));
  } catch (error) {
    const newUrl = await createSandbox({ projectId });
    res.json(newUrl);
  }
});

app.get("/project/:projectId/files", async (req, res) => {
  const { projectId } = req.params;

  const filesToDisplay = await db
    .select({
      path: files.path,
      content: files.content,
    })
    .from(files)
    .where(eq(files.projectId, projectId));

  res.json(filesToDisplay);
});

app.get("/project/:projectId/messages", async (req, res) => {
  const { projectId } = req.params;

  try {
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.projectId, projectId))
      .orderBy(asc(messages.createdAt));

    res.json(history);
  } catch (error) {
    res.status(400).json(error);
  }
});

app.post("/project/:projectId/chat", async (req, res) => {
  const { projectId } = req.params;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const { message } = req.body;

  try {
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .then((r) => r[0]);

    const fileStructure = await db
      .select({ path: files.path })
      .from(files)
      .where(eq(files.projectId, projectId))
      .then((rows) => rows.map((r) => r.path));

    const messagesForProject = await db
      .select()
      .from(messages)
      .where(eq(messages.projectId, projectId));
    const langchainMessages = messagesForProject.map((m) =>
      m.role === "user"
        ? new HumanMessage(m.content)
        : new AIMessage(m.content),
    );

    const systemMessage = new SystemMessage(SYSTEM_PROMPT(fileStructure));

    const graphInput = {
      messages: [
        systemMessage,
        ...langchainMessages,
        new HumanMessage(message),
      ],
    };

    const graph = await createAgentGraph({ projectId, model });

    const stream = await graph.streamEvents(graphInput, {
      version: "v2",
    });

    let finalResponse = "";

    for await (const event of stream) {
      if (event.event === "on_chat_model_stream") {
        const data = event.data.chunk.content;
        if (data && typeof data === "string" && data.length > 0) {
          finalResponse += data;
          res.write(
            `data: ${JSON.stringify({ type: "token", content: data })}\n\n`,
          );
        }
      } else if (event.event === "on_tool_start") {
        const toolName = event.name;
        const data = event.data.input;
        res.write(
          `data: ${JSON.stringify({ type: "tool_start", tool: toolName, input: data })}\n\n`,
        );
        console.log(`${toolName} was used with input: ${data}`);
      } else if (event.event === "on_tool_end") {
        res.write(`data: ${JSON.stringify({ type: "tool_end" })}\n\n`);
      }
    }

    await db.insert(messages).values([
      {
        projectId,
        role: "user",
        type: "text",
        content: message,
      },
      {
        projectId,
        role: "assistant",
        type: "text",
        content: finalResponse,
      },
    ]);

    res.end();
  } catch (error) {
    res.write(
      `data: ${JSON.stringify({ type: "error", error: `${error}` })}\n\n`,
    );
    res.end();
  }
});

app.get("/project/:projectId/download", async (req, res) => {
  const { projectId } = req.params;

  const filesToDownload = await db
    .select()
    .from(files)
    .where(eq(files.projectId, projectId));

  const zip = new AdmZip();

  filesToDownload.forEach((file) => {
    zip.addFile(file.path, file.content);
  });

  const buffer = zip.toBuffer();

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename='project.zip'");
  res.setHeader("Content-Length", buffer.length);

  res.json(buffer);
});

app.listen(3001, () => {
  console.log("Spawn Backend started on port 3001");
});
