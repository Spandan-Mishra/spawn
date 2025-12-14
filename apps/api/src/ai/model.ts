import { ChatOpenAI } from "@langchain/openai";
import { GPTOSSF, QwenCoder3, GPT4oMini } from "./choices";

export const model = new ChatOpenAI({
  model: GPT4oMini,
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
