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
                .where(
                    and(
                        eq(files.projectId, projectId)
                    )
                )
                

                return result.map(f => f.path);
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

                return result[0].content;
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

                const sandboxId = await db
                .select({
                    sandboxId: projects.sandboxId
                })
                .from(projects)
                .where(
                    eq(projects.projectId, projectId)
                )
                .then(res => res[0]?.sandboxId);


                if (sandboxId) {
                    try {
                        const sandbox = await Sandbox.connect(sandboxId);
                        await sandbox.files.write(path, content);
                        
                        return `File ${path} saved and sandbox updated`;
                    } catch (error) {
                        console.error("Error connecting and updating sandbox", error);
                        return `File ${path} saved to database (Sandbox was inactive)`
                    }
                }

                return `File ${path} saved to database`
 
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