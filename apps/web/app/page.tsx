"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Github, Loader2, Send } from "lucide-react";
import axios from "axios";
import { motion, Variants } from "framer-motion";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { FloatingPaths } from "@/components/ui/background-paths";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const models = [
  { id: "qwen/qwen3-coder", name: "QwenCoder 3" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "anthropic/claude-sonnet-4.5", name: "Sonnet 4.5" },
  { id: "openai/gpt-oss-20b:free", name: "GPT-OSS F" },
];

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
  const [selectedModel, setSelectedModel] = useState(models[0]?.id);
  const [showDialog, setShowDialog] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleSpawn = async () => {
    if (!prompt.trim()) return;

    if (!session) {
      setShowDialog(true);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/project`,
        {
          prompt: prompt,
          userId: session?.user?.id,
          model: selectedModel,
        },
      );

      const { projectId } = res.data;

      router.push(`/project/${projectId}`);
    } catch (error) {
      console.error("Error creating project:", error);
      setLoading(false);
    }
  };

  const handleSignIn = async (provider: "github" | "google") => {
    await authClient.signIn.social({
      provider: provider,
      callbackURL: "/",
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-primary flex flex-col items-center justify-center text-zinc-100 p-4 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="absolute right-5 top-5 z-20 flex items-center gap-4">
        {session ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">{session.user?.name}</span>
            <Button
              variant="ghost"
              onClick={() => handleSignOut()}
              className="hover:bg-zinc-800 hover:text-zinc-200"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setShowDialog(true)}
            className="hover:bg-zinc-800 hover:text-zinc-200"
          >
            Sign In
          </Button>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription className="text-zinc-400">
              To spawn a new project, please sign in first.
            </DialogDescription>
          </DialogHeader>

          <Button
            variant="outline"
            onClick={() => handleSignIn("google")}
            className="w-full h-11 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-300 justify-center relative px-10"
          >
            <svg className="h-5 w-5 absolute left-26" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            variant="outline"
            onClick={() => handleSignIn("github")}
            className="w-full h-11 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-300 justify-center relative px-10"
          >
            <Github className="h-5 w-5 absolute left-26" />
            Continue with GitHub
          </Button>
        </DialogContent>
      </Dialog>

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
            <div className="relative w-full mb-10">
              {!prompt && (
                <div className="absolute top-0 left-0 p-4 w-full h-full pointer-events-none text-zinc-500">
                  <TypingAnimation
                    className="text-muted-foreground absolute -top-1 left-6"
                    words={placeholderPrompts}
                    typeSpeed={20}
                    deleteSpeed={10}
                    pauseDelay={1500}
                    loop
                    startOnView={false}
                  />
                </div>
              )}

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full caret-transparent bg-transparent text-white p-4 resize-none outline-none min-h-[100px] scrollbar-track-transparent [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSpawn();
                  }
                }}
              />
            </div>

            <div className="absolute bottom-0 left-4 my-4">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[180px] h-8 bg-zinc-800/50 border-zinc-700 text-zinc-300 text-xs rounded-full focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  {models.map((m) => (
                    <SelectItem
                      key={m.id}
                      value={m.id}
                      className="focus:bg-zinc-800 focus:text-white"
                    >
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
