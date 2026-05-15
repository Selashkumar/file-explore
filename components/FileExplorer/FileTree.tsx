"use client";

import { useState } from "react";

import TreeNode from "./TreeNode";

import { initialTree } from "@/data/initialTree";
import { FileNode } from "./types/fileTree";
import { toggleFolder, renameNode } from "./utils/fileTree";


export default function FileTree() {
  const [tree, setTree] = useState<FileNode[]>(initialTree);

  const [selectedId, setSelectedId] = useState<string>("");

  const handleToggle = (folderId: string) => {
    setTree((prev) => toggleFolder(prev, folderId));
  };

  const handleRename = (
    nodeId: string,
    newName: string
  ) => {
    setTree((prev) =>
      renameNode(prev, nodeId, newName)
    );
  };

  return (
    <div className="w-72 bg-neutral-900 text-white rounded-lg p-2">
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          onToggle={handleToggle}
          selectedId={selectedId}
          onSelect={(node) => setSelectedId(node.id)}
          onRename={handleRename}
        />
      ))}
    </div>
  );
}
