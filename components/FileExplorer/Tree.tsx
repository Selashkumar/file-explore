"use client";

import { useState } from "react";

import TreeNode from "./TreeNode";
import { FileNode } from "./types/fileTree";


interface TreeProps {
    treeNode: FileNode[];
  
    onFolderSelect?: (
      folderId: string
    ) => void;

    onToggle: (
      folderId: string
    ) => void;
  
    onRename: (
      nodeId: string,
      newName: string
    ) => void;
  }

export default function Tree({
    treeNode,
    onFolderSelect,
    onToggle,
    onRename,
}: TreeProps) {
    // selected file/folder
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // select node
    const handleSelect = (node: FileNode) => {
        setSelectedId(node.id);
      
        if (node.type === "folder") {
          onFolderSelect?.(node.id);
        }
    };

    return (
        <div className="w-full text-sm text-white">
            {treeNode.map((node) => (
                <TreeNode
                    key={node.id}
                    node={node}
                    onToggle={onToggle}
                    onSelect={handleSelect}
                    selectedId={selectedId || undefined}
                    onRename={onRename}
                />
            ))}
        </div>
    );
}
