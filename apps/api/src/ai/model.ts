import { ChatOpenAI } from "@langchain/openai"
import { QwenCoder3 } from "./choices"

export const model = new ChatOpenAI({
    model: QwenCoder3,
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
})