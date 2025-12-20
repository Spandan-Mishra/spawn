import { loadHistory, streamChat } from "@/lib/api";
import { parseStream } from "@/lib/stream";
import { ArrowUpRight, Loader2, Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "./messageBubble";
import axios from "axios";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = ({
  projectId,
  onFilesUpdate,
  onStreamFinished,
  onStreamStart,
  onFileOpen,
}: {
  projectId: string;
  onFilesUpdate: () => void;
  onStreamFinished?: () => void;
  onStreamStart?: () => void;
  onFileOpen?: (path: string) => void;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolCall, setToolCall] = useState<string | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, toolCall]);

  useEffect(() => {
    if (hasTriggered || messages.length > 0 || !isHistoryLoaded) return;

    const init = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/project/${projectId}`,
        );
        const prompt = res.data.description;

        if (prompt) {
          setHasTriggered(true);
          await sendMessage(prompt);
        }
      } catch (error) {
        console.error("Error fetching initial prompt:", error);
      }
    };

    init();
  }, [isHistoryLoaded, hasTriggered, messages]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const history = await loadHistory({ projectId });
        setMessages(history);
        setIsHistoryLoaded(true);
      } catch (error) {
        console.error(error);
      }
    }

    fetch();
  }, [projectId]);

  const sendMessage = async (msgContent?: string) => {
    const content = msgContent || input;

    if (!content.trim() || isLoading) return;

    if(onStreamStart) onStreamStart();

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);
    setIsStreaming(false);
    setInput("");

    try {
      const response = await streamChat(projectId, content);

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (!response.body) {
        throw new Error("No response body");
      }

      setIsLoading(false);
      setIsStreaming(true);

      const reader = response.body.getReader();

      await parseStream(reader, (chunk) => {
        if (chunk.type === "token") {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            const lastMessage = newMessages[lastIndex];
            if (lastMessage && lastMessage.role === "assistant") {
              newMessages[lastIndex] = {
                ...lastMessage,
                content: lastMessage.content + chunk.content,
              };
            }
            return newMessages;
          });
        } else if (chunk.type === "tool_start") {
          setToolCall(chunk.tool);
        } else if (chunk.type === "tool_end") {
          setToolCall(null);
          onFilesUpdate();
        }
      });
    } catch (error) {
      console.error("Error during chat streaming:", error);
    } finally {
      setIsLoading(false);
      if (onStreamFinished) {
        onStreamFinished();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800 font-sans">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 text-zinc-100">
          <div className="p-1.5 bg-green-500/10 rounded-md">
            <Terminal className="w-4 h-4 text-green-500" />
          </div>
          <h2 className="text-sm font-medium tracking-tight">Spawn Agent</h2>
          {isStreaming && (
            <span className="flex h-2 w-2 ml-auto">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} onFileOpen={onFileOpen} />
        ))}

        {(isLoading || toolCall) && (
          <div className="flex items-center gap-3 text-zinc-400 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-green-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-zinc-300">
                {toolCall ? "Running task..." : "Thinking..."}
              </span>
              {toolCall && (
                <span className="font-mono text-zinc-500 text-[10px] uppercase tracking-wider">
                  {toolCall}
                </span>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Describe your app..."
            disabled={isLoading}
            className="w-full bg-zinc-900/50 text-sm text-zinc-100 placeholder:text-zinc-500 rounded-xl border border-zinc-800 p-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all duration-200 min-h-[52px] max-h-[200px] overflow-y-auto shadow-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            rows={1}
            style={{
              minHeight: "52px",
              height: input ? "auto" : "52px",
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-4 p-2 bg-green-700 hover:bg-green-600 text-white rounded-lg disabled:opacity-0 disabled:scale-90 transition-all duration-200 shadow-md group-focus-within:opacity-100"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUpRight className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-zinc-600">
            Spawn can make mistakes. Check generated code.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chat;
