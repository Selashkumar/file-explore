"use client";

import { useState } from "react";

import Tree from "./Tree";
import { initialTree } from "@/data/initialTree";
import { FileNode } from "./types/fileTree";
import {
  deleteNode,
  renameNode,
  toggleFolder,
} from "./utils/fileTree";


export default function FileTree() {
  const [tree, setTree] = useState<FileNode[]>(initialTree);

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

  const handleDelete = (nodeId: string) => {
    setTree((prev) =>
      deleteNode(prev, nodeId)
    );
  };

  return (
    <Tree
      treeNode={tree}
      onToggle={handleToggle}
      onCreate={() => undefined}
      onRename={handleRename}
      onDelete={handleDelete}
    />
  );
}
