
export type FileTreeNode = {
    id: string;
    name: string;
    isSelectable: boolean;
    children?: FileTreeNode[];
}

const filesToTree = (files: { path: string }[]): FileTreeNode[] => {
    const root: FileTreeNode[] = [];

  files.forEach((file) => {
    const parts = file.path.split('/'); 
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const pathSoFar = parts.slice(0, index + 1).join('/');

      let existingNode = currentLevel.find((node) => node.name === part);

      if (!existingNode) {
        existingNode = {
          id: pathSoFar, 
          name: part,
          isSelectable: isFile, 
          children: isFile ? undefined : [], 
        };
        currentLevel.push(existingNode);
      }

      if (!isFile && existingNode.children) {
        currentLevel = existingNode.children;
      }
    });
  });

  return root;
}

export { filesToTree };