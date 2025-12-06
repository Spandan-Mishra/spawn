import Sandbox from "@e2b/code-interpreter"
import { tool } from "@langchain/core/tools"
import { and, db, eq, files, projects } from "@repo/db"
import z from "zod"

export const getOnChainTools = async ({ projectId }: { projectId: string }) => {
    return [
        tool(
            async ({}) => {
                const result = await db
                .select({
                    path: files.path,
                })
                .from(files)
                .where(eq(files.projectId, projectId))
                
                return result.map(f => f.path).join("\n");
            },
            {
                name: "list_files",
                description: "List all files in the project",
                schema: z.object({}),
            }
        ),
        tool(
            async ({ path }: { path: string }) => {
                const result = await db
                .select({
                    content: files.content,
                })
                .from(files)
                .where(
                    and(
                        eq(files.projectId, projectId),
                        eq(files.path, path)
                    )
                )
                                        
                if (result.length === 0) {
                    return `Error: File not found at path ${path}`;
                }
                
                console.log(`Content of the file at path ${path}:`, result[0].content);

                return result.length > 0 ? result[0].content : "Error: File not found";
            },
            {
                name: "read_file",
                description: "Read the content of a file given its path",
                schema: z.object({
                    path: z.string(),
                }),
            }
        ),
        tool(
            async ({ path, content }: { path: string; content: string }) => {
                await db
                .insert(files)
                .values({
                    projectId,
                    path,
                    content,
                })
                .onConflictDoUpdate({
                    target: [files.projectId, files.path],
                    set: {
                        content,
                        updatedAt: new Date()
                    }
                })

                const [project] = await db.select().from(projects).where(eq(projects.id, projectId));

                try {
                    if (project?.sandboxId) {
                        const sandbox = await Sandbox.connect(project.sandboxId);
                        await sandbox.files.write(path, content);
                    }

                    return `File ${path} saved to database`
                } catch (error) {
                    console.error(`Error writing to file ${path}:`, error);
                    return `File ${path} saved to database, but failed to write to sandbox`;
                }
 
            },
            {
                name: "write_file",
                description: "Write content to a file at the given path",
                schema: z.object({
                    path: z.string(),
                    content: z.string(),
                }),
            }
        )
    ]
}