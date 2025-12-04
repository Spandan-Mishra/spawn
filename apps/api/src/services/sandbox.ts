import { db, files } from "@repo/db"
import { Sandbox } from "@e2b/code-interpreter"
import { eq } from "@repo/db"

const createSandbox = async ({ 
    projectId 
}: {
    projectId: string
}) => {
    const filesToWrite = await db.select().from(files).where(eq(files.projectId, projectId));
    const sandbox = await Sandbox.create({ apiKey: process.env.E2B_API_KEY! });
    
    await Promise.all(filesToWrite.map(async (file: any) => {
        await sandbox.files.write(file.path, file.content);
    }));

    await sandbox.commands.run("npm install");

    await sandbox.commands.run("npm run dev", { background: true });
    
    return sandbox.getHost(5173);
}

export default createSandbox;