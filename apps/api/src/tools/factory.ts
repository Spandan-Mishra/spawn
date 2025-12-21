import Sandbox from "@e2b/code-interpreter";
import { tool } from "@langchain/core/tools";
import { and, db, eq, files, projects } from "@repo/db";
import Exa from "exa-js";
import z from "zod";

export const getOnChainTools = async ({ projectId }: { projectId: string }) => {
  return [
    tool(
      async ({}) => {
        const result = await db
          .select({
            path: files.path,
          })
          .from(files)
          .where(eq(files.projectId, projectId));

        return result.map((f) => f.path).join("\n");
      },
      {
        name: "list_files",
        description: "List all files in the project",
        schema: z.object({}),
      },
    ),
    tool(
      async ({ path }: { path: string }) => {
        const result = await db
          .select({
            content: files.content,
          })
          .from(files)
          .where(and(eq(files.projectId, projectId), eq(files.path, path)));

        if (result.length === 0) {
          return `Error: File not found at path ${path}`;
        }

        return result[0].content ?? "";
      },
      {
        name: "read_file",
        description: "Read the content of a file given its path",
        schema: z.object({
          path: z.string(),
        }),
      },
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
              updatedAt: new Date(),
            },
          });

        const [project] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, projectId));

        try {
          if (project?.sandboxId) {
            const sandbox = await Sandbox.connect(project.sandboxId);

            const dir = path.split("/").slice(0, -1).join("/");
            if (dir && dir !== ".") {
              await sandbox.files.makeDir(dir);
            }

            await sandbox.files.write(path, content);
          }

          return `File ${path} saved to database`;
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
      },
    ),
    tool(
        async ({ query, type }: { query: string; type: "general" | "image" }) => {
            const exa = new Exa(process.env.EXA_API_KEY);

            const options: any = {
                useAutoprompt: true,
                numResults: 3,
                type: "neural",
            };

            if (type === "general") {
                options.contents = { text: true };
            } 

            try {
                const response = await exa.search(query, options);

                const formattedResults = response.results.map((result: any) => {
                    if (type === "image") {
                        return `Title: ${result.title}\nImage URL: ${result.image || "No image found"}\nSource: ${result.url}`;
                    } else {
                        const summary = result.text ? result.text.slice(0, 300) : "No content available";
                        return `Title: ${result.title}\nURL: ${result.url}\nContent: ${summary}...`;
                    }
                }).join("\n\n---\n\n");

                return formattedResults + "\n\n(SYSTEM NOTE: Now that you have this information, you MUST use 'write_file' to update the application code. Do not just report these findings.)";
            } catch (error) {
                console.error("Exa Search Error:", error);
                return "Error performing web search. Please rely on your internal knowledge.";
            }
        },
        {
            name: "search_web",
            description: "Search the web for real-time information or images. Use type='general' for facts/research, and type='image' to find image URLs for the website.",
            schema: z.object({
                query: z.string().describe("The natural language search query"),
                type: z.enum(["general", "image"]).describe("The type of search: 'general' for text/facts, 'image' for visual assets"),
            }),
        }
    )
  ];
};
