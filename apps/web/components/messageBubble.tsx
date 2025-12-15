import { Message } from "./chat";
import ReactMarkdown from "react-markdown";

const MessageBubble = ({ message }: { message: Message }) => {
  if (!message.content) return null;

  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-green-700 text-white rounded-br-none"
            : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-lg">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;