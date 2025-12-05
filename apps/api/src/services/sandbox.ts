import { db, files, projects } from "@repo/db"
import { Sandbox } from "@e2b/code-interpreter"
import { eq } from "@repo/db"

const createSandbox = async ({ 
    projectId 
}: {
    projectId: string
}) => {
    let sandbox: Sandbox | null = null;

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));

    if (project.sandboxId) {
        try {
            sandbox = await Sandbox.connect(project.sandboxId);
            console.log(`Connected to existing sandbox with ID: ${project.sandboxId}`);
        } catch (error) {
            console.error(`Failed to connect to existing sandbox with ID: ${project.sandboxId}. Error:`, error);
        }
    }

    if (!sandbox) {
        const filesToWrite = await db.select().from(files).where(eq(files.projectId, projectId));

        sandbox = await Sandbox.create({ apiKey: process.env.E2B_API_KEY! });

        await db.update(projects).set({ sandboxId: sandbox.sandboxId }).where(eq(projects.id, projectId));

        await Promise.all(filesToWrite.map(async (file) => {
            if (file.content) {
                await sandbox!.files.write(file.path, file.content);
            }
        }))

        await sandbox.commands.run("npm install");

        await sandbox.commands.run("npm run dev", { background: true });
    }

    return sandbox.getHost(5173);
}

export default createSandbox;