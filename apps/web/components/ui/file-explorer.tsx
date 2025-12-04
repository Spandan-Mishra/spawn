import React, { useMemo } from 'react';
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
        <Folder key={item.id} element={item.name} value={item.id}>
          {item.children.map(renderTreeItem)}
        </Folder>
      );
    }
    
    return (
      <File 
        key={item.id} 
        value={item.id}
        onClick={() => onFileSelect(item.id)}
      >
        <p>{item.name}</p>
      </File>
    );
  };

  return (
    <div className="h-full w-full overflow-hidden border-r bg-background">
      <Tree
        className="h-full overflow-y-auto p-2"
        initialSelectedId={elements[0]?.id}
        elements={elements}
      >
        {elements.map(renderTreeItem)}
      </Tree>
    </div>
  );
}