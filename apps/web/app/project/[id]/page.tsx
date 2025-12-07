"use client";

import { use, useEffect, useState } from "react";
import { File, getFiles, startSandbox } from "../../../lib/api";
import { Editor } from "@monaco-editor/react";
import { FileExplorer } from "@/components/ui/file-explorer";
import Chat from "@/components/chat";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ToggleGroup } from "@radix-ui/react-toggle-group";
import { ToggleGroupItem } from "@/components/ui/toggle-group";

type Params = { id: string };

export default function Page({ params }: { params: Promise<Params> }) {
    const { id } = use(params);
    console.log("Hello from paramjeet", id);
    const [files, setFiles] = useState<File[]>([]);
    const [sandboxUrl, setSandboxUrl] = useState<string>("");
    const [isBooting, setIsBooting] = useState(true);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [selectedFile, setSelectedFile] = useState<string>("src/App.tsx");

    const refetchFiles = async () => {
        const filesData = await getFiles({ projectId: id });
        setFiles(filesData);
    }

    useEffect(() => {
        const fetch = async () => {
            try {
                await refetchFiles();

                const urlData = await startSandbox({ projectId: id });
                setSandboxUrl(urlData);
                setIsBooting(false);
            } catch (error) {
                console.error("Failed to load the project:", error);
            }
        }

        fetch();
    }, [id]);

    const handleFileSelect = (filePath: string) => {
        const file = files.find(f => f.path === filePath);
        if (file) {
            setSelectedFile(filePath);
        }
    }

    console.log("FILES IN PAGE TSX", files);
    console.log("SANDBOX URL XXXXXXXXXXXXXXXXX", sandboxUrl);

    return (
        <div className="h-screen flex overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={25}>
                    <Chat projectId={id} onFilesUpdate={refetchFiles} />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={75}>
                    <ToggleGroup type="single">
                        <ToggleGroupItem value="preview" onClick={() => setActiveTab('preview')}>Preview</ToggleGroupItem>
                        <ToggleGroupItem value="code" onClick={() => setActiveTab('code')}>Code</ToggleGroupItem>
                    </ToggleGroup>
                    {activeTab === 'preview' ? (
                        isBooting ? (
                            <div className="w-full flex justify-center items-center">
                                <p>Booting Sandbox...</p>
                            </div>
                        ) : (
                            <iframe src={`https://${sandboxUrl}`} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms" />
                        )
                    ) : (
                        <ResizablePanelGroup direction="horizontal" className="grid grid-cols-5 h-full">
                            <ResizablePanel defaultSize={20}>
                                <FileExplorer files={files} onFileSelect={handleFileSelect} />
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={80}>
                                <Editor
                                    height="100%"
                                    defaultLanguage="typescript"
                                    theme="vs-dark"
                                    value={files.find(f => f.path === selectedFile)?.content || ""}
                                    options={{ readOnly: true }}
                                />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}