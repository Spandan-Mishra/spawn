import { streamChat } from "@/lib/api";
import { parseStream } from "@/lib/stream";
import { Loader2, Send, Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "./messageBubble";
import axios from "axios";

export interface Message {
    role: "user" | "assistant";
    content: string;
}

const Chat = ({ projectId, onFilesUpdate }: { projectId: string, onFilesUpdate: () => void }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [toolCall, setToolCall] = useState<string | null>(null);
    const [hasTriggered, setHasTriggered] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    useEffect(() => {
        if (hasTriggered || messages.length > 0) return;

        const init = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/project/${projectId}`);
                const prompt = res.data.description;

                if (prompt) {
                    setHasTriggered(true);
                    await sendMessage(prompt);
                }
            } catch (error) {
                console.error("Error fetching initial prompt:", error);
            }
        }

        init();
    }, []);

    const sendMessage = async (msgContent?: string) => {
        const content = msgContent || input;

        if (!content.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content };
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
                    onFilesUpdate();
                }
            })
        } catch (error) {
            console.error("Error during chat streaming:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-full bg-zinc-800 text-zinc-100 border-r border-y-zinc-950">
            
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    Terminal / Chat
                </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => {
                    return <MessageBubble key={index} message={msg} />;
                })}

                <div ref={messagesEndRef} />
            </div>

            {/* Tool call */}
            {toolCall && (
                <div className="px-2 py-2 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2 text-xs text-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing: {toolCall}</span>
                </div>
            )}

            {/* Input */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Enter a prompt to edit your website"
                        disabled={isLoading}
                        className="w-full bg-zinc-800 text-sm text-zinc-200 rounded-md p-3 pr-12 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[50px] max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent"
                        rows={2}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-2 p-2 bg-blue-800 text-white rounded-md hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

        </div>
    )
}

export default Chat;