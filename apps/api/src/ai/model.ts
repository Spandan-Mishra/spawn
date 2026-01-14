import { ChatOpenAI } from "@langchain/openai";

export const getModel = (modelName: string) => {
  return new ChatOpenAI({
    modelName: modelName,
    apiKey: process.env.OPENROUTER_API_KEY!,
    temperature: 0.1,
    maxTokens: 8000,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://spawn.app",
        "X-Title": "Spawn",
      },
    },
  });
};
