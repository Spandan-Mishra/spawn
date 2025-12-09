"use client";

import { use, useEffect, useState } from "react";
import { File, getFiles, startSandbox } from "../../../lib/api";
import { Editor } from "@monaco-editor/react";
import { FileExplorer } from "@/components/ui/file-explorer";
import Chat from "@/components/chat";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ToggleGroup } from "@radix-ui/react-toggle-group";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { StepsLoader } from "@/components/stepsLoader";

type Params = { id: string };

export default function Page({ params }: { params: Promise<Params> }) {
    const { id } = use(params);
    const [files, setFiles] = useState<File[]>([]);
    const [sandboxUrl, setSandboxUrl] = useState<string>("");
    const [status, setStatus] = useState<'generating' | 'booting' | 'ready'>('generating');
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

    const handleGenerationComplete = async () => {
        if(status === 'ready') return ;

        setStatus('booting');

        try {
            const sandboxUrl = await startSandbox({ projectId: id });
            setSandboxUrl(sandboxUrl);
            setStatus('ready');
        } catch(error) {
            console.error("Failed to boot sandbox: ", error);
        }
    }

    return (
        <div className="h-screen flex overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={25}>
                    <Chat projectId={id} onFilesUpdate={refetchFiles} onStreamFinished={handleGenerationComplete} />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={75}>
                   {status === 'ready' && <ToggleGroup type="single">
                        <ToggleGroupItem value="preview" onClick={() => setActiveTab('preview')}>Preview</ToggleGroupItem>
                        <ToggleGroupItem value="code" onClick={() => setActiveTab('code')}>Code</ToggleGroupItem>
                    </ToggleGroup>}
                    <div className="h-full w-full">
                        {status !== 'ready' && (
                            <div className="h-full w-full z-50 bg-zinc-950">
                            <StepsLoader currentStep={status} />
                        </div>
                        )}

                        {status === 'ready' && (
                            activeTab === 'preview' ? (
                                <iframe src={`https://${sandboxUrl}`} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms" />
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
                            )
                        )}
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}