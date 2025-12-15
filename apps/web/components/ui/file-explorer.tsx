import React, { useMemo } from "react";
import { Tree, Folder, File } from "./file-tree";
import { filesToTree, FileTreeNode } from "@/lib/filesToTree";

interface FileExplorerProps {
  files: { path: string; content: string }[];
  onFileSelect: (path: string) => void;
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  const elements = useMemo(() => filesToTree(files), [files]);

  const renderTreeItem = (item: FileTreeNode) => {
    if (item.children) {
      return (
        <Folder 
            key={item.id} 
            element={item.name} 
            value={item.id} 
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          {item.children.map(renderTreeItem)}
        </Folder>
      );
    }

    return (
      <File 
        key={item.id} 
        value={item.id} 
        onClick={() => onFileSelect(item.id)}
        className="text-zinc-400 hover:bg-zinc-800 hover:text-green-400 cursor-pointer transition-colors data-[selected=true]:text-green-400 data-[selected=true]:bg-green-400/10"
      >
        <p>{item.name}</p>
      </File>
    );
  };

  return (
    <div className="h-full w-full overflow-hidden bg-zinc-950 border-r border-zinc-800">
      <div className="p-3 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Explorer</span>
      </div>
      <Tree
        className="h-full overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
        initialSelectedId={elements[0]?.id}
        elements={elements}
      >
        {elements.map(renderTreeItem)}
      </Tree>
    </div>
  );
}