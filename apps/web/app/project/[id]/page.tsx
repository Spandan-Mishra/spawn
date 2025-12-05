"use client";

import { use, useEffect, useState } from "react";
import { File, getFiles, startSandbox } from "../../../lib/api";
import { Editor } from "@monaco-editor/react";
import { FileExplorer } from "@/components/ui/file-explorer";

type Params = { id: string };

export default function Page({ params }: { params: Promise<Params> }) {
    const { id } = use(params);
    console.log("Hello from paramjeet", id);
    const [files, setFiles] = useState<File[]>([]);
    const [sandboxUrl, setSandboxUrl] = useState<string>("");
    const [isBooting, setIsBooting] = useState(true);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('code');
    const [selectedFile, setSelectedFile] = useState<string>("src/App.tsx");

    useEffect(() => {
        const fetch = async () => {
            try {
                const [filesData, sandboxData] = await Promise.all([
                    getFiles({ projectId: id }),
                    startSandbox({ projectId: id })
                ]);

                console.log("Sandbox Data:", sandboxData);

                setFiles(filesData);
                setSandboxUrl(sandboxData);
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
                Conversation Area
            </div>
            <div className="w-3/4">
                {activeTab === 'preview' ? (
                    isBooting ? (
                        <div className="w-full flex justify-center items-center">
                            <p>Booting Sandbox...</p>
                        </div>
                    ) : (
                        <iframe src={`https://${sandboxUrl}`} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms" />
                    )
                ) : (
                    <div className="flex h-full">
                        <FileExplorer files={files} onFileSelect={handleFileSelect} />
                        <Editor height="90vh" defaultLanguage="typescript" theme="vs-dark" value={files.find(f => f.path === selectedFile)?.content || ""} options={{ readOnly: true }} />
                    </div>
                )}
            </div>
        </div>
    )
}