import { prisma } from "@repo/db"
import { Sandbox } from "@e2b/code-interpreter"

const createSandbox = async ({ 
    projectId 
}: {
    projectId: string
}) => {
    const files = await prisma.file.findMany({
        where: {
            projectId
        }
    })

    const sandbox = await Sandbox.create();
    
    await Promise.all(files.map(async (file: any) => {
        await sandbox.files.write(file.path, file.content);
    }));

    await sandbox.commands.run("npm install");

    await sandbox.commands.run("npm run dev", { background: true });
    
    return sandbox.getHost(3000);
}

export default createSandbox;