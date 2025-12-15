"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import axios from "axios";
import { motion, Variants } from "framer-motion";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { FloatingPaths } from "@/components/ui/background-paths";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const placeholderPrompts = [
  "Build a solitaire game with a green background...",
  "Build a portfolio for a design engineer...",
  "Make a todo app with a dark theme...",
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

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
    <div className="min-h-screen bg-zinc-950 font-primary flex flex-col items-center justify-center text-zinc-100 p-4 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <motion.div
        className="max-w-xl w-full text-center space-y-10 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 className="text-9xl font-bold font-cta tracking-tighter bg-clip-text text-white">
            Spawn
          </h1>
          <p className="text-zinc-400 text-lg">
            Spawn your projects, with just a prompt.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-white to-green-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
          <div className="relative bg-zinc-900 rounded-lg p-2 border border-zinc-800 flex items-center shadow-2xl">
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
              className="w-full caret-white bg-transparent text-white p-4 resize-none outline-none min-h-[120px] text-lg leading-relaxed placeholder:opacity-0 z-10"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSpawn();
                }
              }}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ShimmerButton
            onClick={handleSpawn}
            disabled={loading || !prompt.trim()}
            className="px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/20"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5 text-white" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
            <span className="text-white">
              {loading ? "Spawning Environment..." : "Spawn App"}
            </span>
          </ShimmerButton>
        </motion.div>
      </motion.div>
    </div>
  );
}
