"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import axios from "axios";
import { TypingAnimation } from "@/components/ui/typing-animation";

const placeholderPrompts = [
  "Build a solitaire game with a green background...",
  "Build a portfolio for a design engineer...",
  "Make a todo app with a dark theme...",
];

export default function LandingPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSpawn = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/project`,
        {
          prompt: prompt,
          userId: process.env.NEXT_PUBLIC_USERID,
        },
      );

      const { projectId } = res.data;

      router.push(`/project/${projectId}`);
    } catch (error) {
      console.error("Error creating project:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 p-4">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Spawn.
          </h1>
          <p className="text-zinc-400 text-lg">
            Spawn your projects, with just a prompt.
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
          <div className="relative bg-zinc-900 rounded-lg p-2 border border-zinc-800 flex items-center">
            {!prompt && (
              <div className="absolute top-0 left-0 p-4 w-full h-full pointer-events-none text-zinc-500">
                <TypingAnimation
                  className="text-muted-foreground absolute -top-1 left-6"
                  words={placeholderPrompts}
                  typeSpeed={20}
                  deleteSpeed={10}
                  pauseDelay={1500}
                  loop
                />
              </div>
            )}

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full caret-transparent bg-transparent text-white p-4 resize-none outline-none min-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSpawn();
                }
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSpawn}
          disabled={loading || !prompt.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? "Spawning Environment..." : "Spawn App"}
        </button>
      </div>
    </div>
  );
}
