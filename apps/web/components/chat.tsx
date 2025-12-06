import { streamChat } from "@/lib/api";
import { parseStream } from "@/lib/stream";
import { useEffect, useRef, useState } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const Chat = ({ projectId }: { projectId: string }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [toolCall, setToolCall] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages(prev => {
            return [...prev, userMessage];
        })

        const payload = input;
        setIsLoading(true);
        setInput("");

        try {
            const response = await streamChat(projectId, payload);

            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            if (!response.body) {
                throw new Error("No response body");
            }

            const reader = response.body.getReader();

            await parseStream(reader, (chunk) => {
                if(chunk.type === "token") {
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1] as Message;
                        if (lastMessage && lastMessage.role === "assistant") {
                            lastMessage.content += chunk.content;
                        }

                        newMessages[newMessages.length - 1] = lastMessage;

                        return newMessages;
                    })
                } else if (chunk.type === "tool_start") {
                    setToolCall(chunk.tool);
                } else if (chunk.type === "tool_end") {
                    setToolCall(null);
                }
            })
        } catch (error) {
            console.error("Error during chat streaming:", error);
        } finally {
            setIsLoading(false);
        }
    }
}