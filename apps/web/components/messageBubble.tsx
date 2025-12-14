import { Message } from "./chat";
import ReactMarkdown from "react-markdown";

const MessageBubble = ({ message }: { message: Message }) => {
  if (!message.content || message.content.trim() === "") return;
  const isUser = message.role === "user";

  return (
    <div
      className={`flex flex-col max-w-[85%] ${isUser ? "self-end items-end" : "self-start items-start"}`}
    >
      <div
        className={`px-4 py-2 rounded-lg text-sm ${isUser ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-100"}`}
      >
        {!isUser ? (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
