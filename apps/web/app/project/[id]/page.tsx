"use client";

import { use, useEffect, useState } from "react";
import { File, getFiles, startSandbox } from "../../../lib/api";
import { Editor } from "@monaco-editor/react";
import { FileExplorer } from "@/components/ui/file-explorer";
import Chat from "@/components/chat";

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
        <div className="h-screen w-full flex">
            <div className="w-1/4 border-r overflow-y-auto">
                <Chat projectId={id} onFilesUpdate={refetchFiles} />
            </div>
            <div className="w-3/4">
                <div className="absolute bottom-0 z-10">
                    <button className={`px-4 py-2 ${activeTab === 'preview' ? 'bg-gray-300' : ''}`} onClick={() => setActiveTab('preview')}>Preview</button>
                    <button className={`px-4 py-2 ${activeTab === 'code' ? 'bg-gray-300' : ''}`} onClick={() => setActiveTab('code')}>Code</button>
                </div>
                {activeTab === 'preview' ? (
                    isBooting ? (
                        <div className="w-full flex justify-center items-center">
                            <p>Booting Sandbox...</p>
                        </div>
                    ) : (
                        <iframe src={`https://${sandboxUrl}`} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms" />
                    )
                ) : (
                    <div className="grid grid-cols-5 h-full">
                        <div className="col-span-1 h-full border-r overflow-auto">
                            <FileExplorer files={files} onFileSelect={handleFileSelect} />
                        </div>
                        <div className="col-span-4 h-full">
                            <Editor
                                height="100%"
                                defaultLanguage="typescript"
                                theme="vs-dark"
                                value={files.find(f => f.path === selectedFile)?.content || ""}
                                options={{ readOnly: true }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}