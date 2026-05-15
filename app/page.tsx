// app/page.tsx

"use client";

import { useState } from "react";
import { FilePlus, FolderPlus, X } from "lucide-react";

import Tree from "@/components/FileExplorer/Tree";

import { initialTree } from "@/data/initialTree";
import { FileNode } from "@/components/FileExplorer/types/fileTree";
import {
  addNode,
  renameNode,
  toggleFolder,
} from "@/components/FileExplorer/utils/fileTree";


type CreateType = "file" | "folder" | null;

export default function App() {
  // =========================
  // TREE STATE
  // =========================

  const [tree, setTree] = useState<FileNode[]>(initialTree);

  // selected folder
  const [selectedFolderId, setSelectedFolderId] =
    useState<string>("1");

  // =========================
  // MODAL STATE
  // =========================

  const [openModal, setOpenModal] =
    useState<CreateType>(null);

  const [inputValue, setInputValue] = useState("");

  // =========================
  // OPEN MODAL
  // =========================

  const handleOpenModal = (type: CreateType) => {
    setOpenModal(type);
    setInputValue("");
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const handleCloseModal = () => {
    setOpenModal(null);
    setInputValue("");
  };
  const handleRename = (
    nodeId: string,
    newName: string
  ) => {
    setTree((prev) =>
      renameNode(prev, nodeId, newName)
    );
  };

  const handleToggleFolder = (folderId: string) => {
    setTree((prev) => toggleFolder(prev, folderId));
  };

  // =========================
  // CREATE NODE
  // =========================

  const handleCreateNode = () => {
    if (!inputValue.trim()) return;

    const isFolder = openModal === "folder";

    const newNode: FileNode = {
      id: crypto.randomUUID(),
      name: inputValue,
      type: isFolder ? "folder" : "file",

      ...(isFolder && {
        children: [],
        isOpen: false,
      }),
    };

    setTree((prev) =>
      addNode(prev, selectedFolderId, newNode)
    );

    handleCloseModal();
  };

  return (
    <main className="h-screen bg-neutral-950 text-white p-4 flex items-start justify-center">
      {/* EXPLORER */}
      <div className="w-80 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
          <h2 className="text-sm font-semibold tracking-wide">
            EXPLORER
          </h2>

          {/* TOOLBAR */}
          <div className="flex items-center gap-2">
            {/* NEW FILE */}
            <button
              onClick={() => handleOpenModal("file")}
              className="
                p-1.5 rounded
                hover:bg-neutral-800
                transition
              "
            >
              <FilePlus size={18} />
            </button>

            {/* NEW FOLDER */}
            <button
              onClick={() => handleOpenModal("folder")}
              className="
                p-1.5 rounded
                hover:bg-neutral-800
                transition
              "
            >
              <FolderPlus size={18} />
            </button>
          </div>
        </div>

        {/* TREE */}
        <div className="p-2">
          <Tree
            treeNode={tree}
            onFolderSelect={setSelectedFolderId}
            onToggle={handleToggleFolder}
            onRename={handleRename}
          />
        </div>
      </div>

      {/* MODAL */}
      {openModal && (
        <div
          className="
            fixed inset-0
            bg-black/50
            flex items-center justify-center
          "
        >
          <div
            className="
              w-[340px]
              bg-neutral-900
              border border-neutral-800
              rounded-xl
              p-4
            "
          >
            {/* TOP */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Create New {openModal}
              </h3>

              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-neutral-800 rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* INPUT */}
            <input
              autoFocus
              type="text"
              value={inputValue}
              onChange={(e) =>
                setInputValue(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateNode();
                }
              }}
              placeholder={
                openModal === "file"
                  ? "example.tsx"
                  : "components"
              }
              className="
                w-full
                bg-neutral-800
                border border-neutral-700
                rounded-lg
                px-3 py-2
                outline-none
                focus:border-blue-500
              "
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCloseModal}
                className="
                  px-4 py-2
                  rounded-lg
                  bg-neutral-800
                  hover:bg-neutral-700
                "
              >
                Cancel
              </button>

              <button
                onClick={handleCreateNode}
                className="
                  px-4 py-2
                  rounded-lg
                  bg-blue-600
                  hover:bg-blue-500
                "
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
