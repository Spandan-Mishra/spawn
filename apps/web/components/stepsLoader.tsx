import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal";

export function StepsLoader({
  currentStep,
}: {
  currentStep: "generating" | "booting" | "ready";
}) {
  const showBooting = currentStep === "booting" || currentStep === "ready";
  const showReady = currentStep === "ready";

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-950">
      <div className="max-w-xl w-full mx-auto shadow-2xl">
        <Terminal className="bg-zinc-900 border border-zinc-800 min-h-[300px]">
          <TypingAnimation className="text-white">
            &gt; spawn init
          </TypingAnimation>

          <AnimatedSpan className="text-green-500">
            ✔ Analyzing prompt requirements.
          </AnimatedSpan>

          <AnimatedSpan className="text-green-500">
            ✔ Spinning up Vite + React + Tailwind v4.
          </AnimatedSpan>

          <AnimatedSpan className="text-green-500">
            ✔ Integrating Shadcn UI registry.
          </AnimatedSpan>

          <AnimatedSpan className="text-blue-500">
            Generating component logic...
          </AnimatedSpan>

          <AnimatedSpan className="text-zinc-500">
            Writing source files for preview...
          </AnimatedSpan>

          {showBooting && (
            <>
              <TypingAnimation className="text-white">
                &gt; npm install && npm run dev
              </TypingAnimation>

              <AnimatedSpan delay={1500} className="text-yellow-500">
                ⚙ Initializing Preview Environment
              </AnimatedSpan>

              <AnimatedSpan delay={2500} className="text-green-500">
                ✔ Filesystem hydrated.
              </AnimatedSpan>

              <AnimatedSpan delay={3500} className="text-green-500">
                ✔ Dependencies installed.
              </AnimatedSpan>
            </>
          )}

          {showReady && (
            <>
              <AnimatedSpan delay={200} className="text-green-500">
                ✔ Dev server active on port 5173.
              </AnimatedSpan>

              <TypingAnimation delay={500} className="text-blue-400 font-bold">
                Success! Project is live.
              </TypingAnimation>
            </>
          )}
        </Terminal>
      </div>
    </div>
  );
}
