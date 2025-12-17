"use client";

import { use, useEffect, useState } from "react";
import { File, getFiles, heartbeat, startSandbox } from "../../../lib/api";
import { Editor } from "@monaco-editor/react";
import { FileExplorer } from "@/components/ui/file-explorer";
import Chat from "@/components/chat";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { StepsLoader } from "@/components/stepsLoader";
import { Code2, Eye, Laptop, Loader2 } from "lucide-react";

type Params = { id: string };

export default function Page({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const [files, setFiles] = useState<File[]>([]);
  const [sandboxUrl, setSandboxUrl] = useState<string>("");
  const [status, setStatus] = useState<"generating" | "booting" | "ready">(
    "generating",
  );
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [selectedFile, setSelectedFile] = useState<string>("src/App.tsx");
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const refetchFiles = async () => {
    const filesData = await getFiles({ projectId: id });
    setFiles(filesData);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        await refetchFiles();
      } catch (error) {
        console.error("Failed to load the project:", error);
      }
    };

    fetch();
  }, []);

  useEffect(() => {
    if (status === "ready") {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowLoader(true);
    }
  }, [status]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const heartbeatUrl = await heartbeat({ projectId: id });

        if(heartbeatUrl !== sandboxUrl) {
          setSandboxUrl(heartbeatUrl);
        }
      } catch (error) {
        console.error("Failed to perform heartbeat functionality: ", error);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [id, sandboxUrl]);

  const handleFileSelect = (filePath: string) => {
    const file = files.find((f) => f.path === filePath);
    if (file) {
      setSelectedFile(filePath);
    }
  };

  const handleGenerationStart = async () => {
    setIsUpdating(true);
  }

  const handleGenerationComplete = async () => {
    setIsUpdating(false);

    if (status === "ready") return;
    setStatus("booting");
    try {
      const sandboxUrl = await startSandbox({ projectId: id });
      setSandboxUrl(sandboxUrl);
      setStatus("ready");
    } catch (error) {
      console.error("Failed to boot sandbox: ", error);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <ResizablePanelGroup direction="horizontal">
        {/* LEFT PANEL: CHAT */}
        <ResizablePanel
          defaultSize={25}
          minSize={20}
          className="border-r border-zinc-800"
        >
          <Chat
            projectId={id}
            onFilesUpdate={refetchFiles}
            onStreamFinished={handleGenerationComplete}
            onStreamStart={handleGenerationStart}
          />
        </ResizablePanel>

        <ResizableHandle className="bg-zinc-800 hover:bg-green-500 transition-colors w-[2px]" />

        {/* RIGHT PANEL: WORKSPACE */}
        <ResizablePanel defaultSize={75}>
          <div className="h-full w-full relative">
            {status === "ready" && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-full shadow-xl">
                  <ToggleGroup
                    type="single"
                    value={activeTab}
                    onValueChange={(value) =>
                      value && setActiveTab(value as "preview" | "code")
                    }
                    className="flex"
                  >
                    <ToggleGroupItem
                      value="preview"
                      className="px-4 py-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 data-[state=on]:bg-zinc-800 data-[state=on]:text-green-400 transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-xs font-medium">Preview</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="code"
                      className="px-4 py-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 data-[state=on]:bg-zinc-800 data-[state=on]:text-green-400 transition-all flex items-center gap-2"
                    >
                      <Code2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Code</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            )}

            {showLoader && (
              <div className="absolute inset-0 z-50 bg-zinc-950 flex items-center justify-center">
                <StepsLoader currentStep={status} />
              </div>
            )}

            {isUpdating && status === 'ready' && (
               <div className="absolute inset-0 z-40 bg-zinc-950/50 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
                  <div className="bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                      <span className="text-sm font-medium text-zinc-200">Updating application...</span>
                  </div>
               </div>
            )}

            <div className="h-full w-full">
              {status === "ready" &&
                (activeTab === "preview" ? (
                  <div className="w-full h-full bg-zinc-900/50 backdrop-blur-sm pt-[70px] pb-4 px-4">
                    <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl border border-zinc-800 relative">
                      <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-100 border-b border-zinc-200 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                        <div className="mx-auto text-xs text-zinc-400 font-medium flex items-center gap-1">
                          <Laptop className="w-3 h-3" />
                          localhost:5173
                        </div>
                      </div>
                      <iframe
                        src={`https://${sandboxUrl}`}
                        className="w-full h-[calc(100%-32px)] mt-8 border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        title="Preview"
                      />
                    </div>
                  </div>
                ) : (
                  <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full pt-[70px]"
                  >
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                      <FileExplorer
                        files={files}
                        onFileSelect={handleFileSelect}
                      />
                    </ResizablePanel>
                    <ResizableHandle className="bg-zinc-800 w-[1px]" />
                    <ResizablePanel defaultSize={80}>
                      <Editor
                        height="100%"
                        defaultLanguage="typescript"
                        theme="vs-dark"
                        value={
                          files.find((f) => f.path === selectedFile)?.content ||
                          "// Select a file to view content"
                        }
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineHeight: 24,
                          padding: { top: 20 },
                          fontFamily:
                            "'JetBrains Mono', 'Fira Code', monospace",
                        }}
                      />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                ))}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
