import { db, files, projects } from "@repo/db";
import { Sandbox } from "@e2b/code-interpreter";
import { eq } from "@repo/db";

const createSandbox = async ({ projectId }: { projectId: string }) => {
  let sandbox: Sandbox | null = null;
  let isNewSandbox = false;

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));
  if (!project) {
    throw new Error("Project not found in database");
  }

  if (project.sandboxId) {
    try {
      sandbox = await Sandbox.connect(project.sandboxId);
      console.log("Connected to existing sandbox:", project.sandboxId);
    } catch (error) {
      console.error(
        "Failed to connect to existing sandbox, creating a new one",
      );
      sandbox = null;
    }
  }

  if (!sandbox) {
    isNewSandbox = true;

    sandbox = await Sandbox.create("code-interpreter-v1", {
      apiKey: process.env.E2B_API_KEY!,
    });
    await db
      .update(projects)
      .set({ sandboxId: sandbox.sandboxId })
      .where(eq(projects.id, projectId));
  }

  if (isNewSandbox && sandbox) {
    const filesToWrite = await db
      .select()
      .from(files)
      .where(eq(files.projectId, projectId));

    const uniqueDirs = new Set<string>();
    filesToWrite.forEach((file) => {
      const parts = file.path.split("/");
      if (parts.length > 1) {
        const dir = parts.slice(0, -1).join("/");
        uniqueDirs.add(dir);
      }
    });

    const sortedDirs = Array.from(uniqueDirs).sort(
      (a, b) => a.length - b.length,
    );

    for (const dir of sortedDirs) {
      try {
        await sandbox.files.makeDir(dir);
      } catch (e) {}
    }

    await Promise.all(
      filesToWrite.map(async (file) => {
        if (file.content) {
          await sandbox!.files.write(file.path, file.content);
        }
      }),
    );

    await sandbox.commands.run("npm install");

    await sandbox.commands.run("npm run dev", { background: true });
  } else {
    await sandbox.commands.run("npm run dev", { background: true });
  }

  return sandbox.getHost(5173);
};

export default createSandbox;
