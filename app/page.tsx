"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FilePlus,
  FolderPlus,
  Moon,
  Search,
  Sun,
} from "lucide-react";

import Tree from "@/components/FileExplorer/Tree";

import { FileNode } from "@/components/FileExplorer/types/fileTree";
import {
  addNode,
  collectNodeIds,
  deleteNode,
  expandFolder,
  findNode,
  findParentFolderId,
  hasNodeNameInFolder,
  orderTreeNodes,
  renameNode,
  toggleFolder,
  updateFileContent,
} from "@/components/FileExplorer/utils/fileTree";
import { filterTree } from "@/components/FileExplorer/utils/filterTree";
import EditorPanel from "@/components/EditorPanel";

const STORAGE_KEY = "vscode-file-explorer-tree";

type CreateNodeType = "file" | "folder";

interface PendingCreate {
  type: CreateNodeType;
  parentFolderId: string | null;
}

export default function App() {
  const [darkMode, setDarkMode] =
    useState(true);

  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedFolderId, setSelectedFolderId] =
    useState<string | null>(null);
  const [isLoaded, setIsLoaded] =
    useState(false);
  const [search, setSearch] = useState("");
  const [openTabIds, setOpenTabIds] = useState<string[]>([]);
  const [activeTabId, setActiveTabId] =
    useState<string | null>(null);

  const [pendingCreate, setPendingCreate] =
    useState<PendingCreate | null>(null);
  const [createName, setCreateName] = useState("");
  const [createError, setCreateError] = useState("");

  // Filtering is derived from the saved tree so clearing search never mutates folder state.
  const filteredTree = useMemo(
    () => filterTree(tree, search),
    [search, tree]
  );

  const openTabs = useMemo(
    () =>
      openTabIds
        .map((fileId) => findNode(tree, fileId))
        .filter(
          (node): node is FileNode => node?.type === "file"
        ),
    [openTabIds, tree]
  );

  const isSearching = search.trim().length > 0;

  const trimmedCreateName = createName.trim();

  // Names only need to be unique next to their siblings, just like a real file explorer.
  const hasCreateDuplicate =
    !!pendingCreate &&
    !!trimmedCreateName &&
    hasNodeNameInFolder(
      tree,
      pendingCreate.parentFolderId,
      trimmedCreateName
    );

  const inlineCreateError =
    createError ||
    (hasCreateDuplicate
      ? `A file or folder named "${trimmedCreateName}" already exists here.`
      : "");

  const activeEditorTabId =
    activeTabId &&
    openTabs.some((tab) => tab.id === activeTabId)
      ? activeTabId
      : openTabs.at(-1)?.id ?? null;

  useEffect(() => {
    // localStorage is browser-only, so the tree is hydrated after the client mounts.
    const loadTree = () => {
      try {
        const savedTree =
          localStorage.getItem(STORAGE_KEY);

        if (!savedTree) {
          setTree([]);
          setSelectedFolderId(null);
          return;
        }

        const parsedTree = JSON.parse(savedTree);
        const nextTree: FileNode[] = Array.isArray(parsedTree)
          ? orderTreeNodes(parsedTree)
          : [];

        setTree(nextTree);
        setSelectedFolderId(null);
      } catch (error) {
        console.error("Failed to load file tree:", error);
        setTree([]);
        setSelectedFolderId(null);
      } finally {
        setIsLoaded(true);
      }
    };

    const timeoutId = window.setTimeout(loadTree, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tree)
      );
    } catch (error) {
      console.error("Failed to save file tree:", error);
    }
  }, [isLoaded, tree]);

  const resolveCreateParentFolderId = (
    folderId?: string | null
  ) => {
    const requestedFolderId =
      folderId === undefined ? selectedFolderId : folderId;

    if (
      requestedFolderId &&
      findNode(tree, requestedFolderId)?.type === "folder"
    ) {
      return requestedFolderId;
    }

    return null;
  };

  const handleStartCreate = (
    type: CreateNodeType,
    folderId?: string | null
  ) => {
    if (!isLoaded) return;

    const parentFolderId =
      resolveCreateParentFolderId(folderId);

    setSearch("");
    setCreateName("");
    setCreateError("");
    setPendingCreate({
      type,
      parentFolderId,
    });

    if (parentFolderId) {
      setSelectedFolderId(parentFolderId);
      setTree((prev) => expandFolder(prev, parentFolderId));
    } else {
      setSelectedFolderId(null);
    }
  };

  const handleCancelCreate = () => {
    setPendingCreate(null);
    setCreateName("");
    setCreateError("");
  };

  const handleClearSelection = () => {
    setSelectedFolderId(null);
    handleCancelCreate();
  };

  const handleRename = (
    nodeId: string,
    newName: string
  ) => {
    const trimmedName = newName.trim();
    const currentNode = findNode(tree, nodeId);
    const parentFolderId = findParentFolderId(tree, nodeId);

    if (
      !trimmedName ||
      !currentNode ||
      parentFolderId === undefined ||
      currentNode.name === trimmedName ||
      hasNodeNameInFolder(
        tree,
        parentFolderId,
        trimmedName,
        nodeId
      )
    ) {
      return;
    }

    setTree((prev) =>
      renameNode(prev, nodeId, trimmedName)
    );
  };

  const handleToggleFolder = (folderId: string) => {
    setTree((prev) => toggleFolder(prev, folderId));
  };

  const handleDeleteNode = (nodeId: string) => {
    const deletedNode = findNode(tree, nodeId);
    // Closing tabs from the deleted subtree keeps the editor from pointing at stale nodes.
    const deletedIds = deletedNode
      ? collectNodeIds(deletedNode)
      : [nodeId];
    const nextOpenTabIds = openTabIds.filter(
      (fileId) => !deletedIds.includes(fileId)
    );

    setOpenTabIds(nextOpenTabIds);
    setActiveTabId((current) => {
      if (current && deletedIds.includes(current)) {
        return nextOpenTabIds.at(-1) ?? null;
      }

      return current;
    });

    setTree((prev) => {
      const nextTree = deleteNode(prev, nodeId);

      setSelectedFolderId((current) => {
        if (
          current &&
          findNode(nextTree, current)?.type === "folder"
        ) {
          return current;
        }

        return null;
      });

      return nextTree;
    });
  };

  const handleCommitCreate = () => {
    const trimmedName = trimmedCreateName;

    if (!pendingCreate) return;

    if (!trimmedName) {
      setCreateError("Enter a name to create an item.");
      return;
    }

    if (hasCreateDuplicate) {
      setCreateError(
        `A file or folder named "${trimmedName}" already exists here.`
      );
      return;
    }

    const isFolder = pendingCreate.type === "folder";

    const newNode: FileNode = {
      id: crypto.randomUUID(),
      name: trimmedName,
      type: isFolder ? "folder" : "file",

      ...(!isFolder && {
        content: "",
      }),

      ...(isFolder && {
        children: [],
        isOpen: false,
      }),
    };

    setTree((prev) => {
      const targetFolder = pendingCreate.parentFolderId
        ? findNode(prev, pendingCreate.parentFolderId)
        : null;

      if (
        hasNodeNameInFolder(
          prev,
          pendingCreate.parentFolderId,
          trimmedName
        )
      ) {
        return prev;
      }

      if (
        pendingCreate.parentFolderId &&
        targetFolder?.type === "folder"
      ) {
        return addNode(
          prev,
          pendingCreate.parentFolderId,
          newNode
        );
      }

      return orderTreeNodes([...prev, newNode]);
    });

    if (!isFolder) {
      setOpenTabIds((prev) =>
        prev.includes(newNode.id) ? prev : [...prev, newNode.id]
      );
      setActiveTabId(newNode.id);
    }

    handleCancelCreate();
  };

  const handleOpenFile = (fileId: string) => {
    const file = findNode(tree, fileId);

    if (file?.type !== "file") return;

    setOpenTabIds((prev) =>
      prev.includes(fileId) ? prev : [...prev, fileId]
    );
    setActiveTabId(fileId);
  };

  const handleCloseTab = (fileId: string) => {
    const currentIndex = openTabIds.indexOf(fileId);
    const nextTabIds = openTabIds.filter((id) => id !== fileId);

    setOpenTabIds(nextTabIds);

    setActiveTabId((current) => {
      if (current !== fileId) {
        return current;
      }

      return (
        nextTabIds[currentIndex] ??
        nextTabIds[currentIndex - 1] ??
        null
      );
    });
  };

  const handleContentChange = (
    fileId: string,
    content: string
  ) => {
    setTree((prev) =>
      updateFileContent(prev, fileId, content)
    );
  };

  return (
    <main className={`vscode-app ${darkMode ? "dark" : ""}`}>
      <div className="vscode-explorer">
        <div className="vscode-header">
          <h2 className="vscode-header-title">
            EXPLORER
          </h2>

          <div className="flex items-center gap-1">
            <button
              aria-label="New file"
              title="New file"
              onClick={() => handleStartCreate("file")}
              disabled={!isLoaded}
              className="vscode-icon-button"
            >
              <FilePlus size={16} />
            </button>

            <button
              aria-label="New folder"
              title="New folder"
              onClick={() => handleStartCreate("folder")}
              disabled={!isLoaded}
              className="vscode-icon-button"
            >
              <FolderPlus size={16} />
            </button>

            <button
              aria-label={
                darkMode
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              title={
                darkMode
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              onClick={() => setDarkMode((prev) => !prev)}
              className="vscode-icon-button"
            >
              {darkMode ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}
            </button>
          </div>
        </div>

        <div className="vscode-search">
          <div className="vscode-search-field">
            <Search
              size={14}
              className="vscode-search-icon"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="vscode-input vscode-search-input"
            />
          </div>
        </div>

        <div className="vscode-tree-shell">
          <Tree
            treeNode={filteredTree}
            keyboardEnabled={!pendingCreate}
            creating={pendingCreate}
            createValue={createName}
            createError={inlineCreateError}
            emptyTitle={
              isSearching
                ? "No matching files or folders"
                : "No files or folders"
            }
            emptyDescription={
              isSearching
                ? "Clear search to show the full tree"
                : "Use the toolbar above to create your first file or folder"
            }
            onFolderSelect={setSelectedFolderId}
            onClearSelection={handleClearSelection}
            onToggle={handleToggleFolder}
            onCreate={handleStartCreate}
            onCreateValueChange={(value) => {
              setCreateName(value);
              setCreateError("");
            }}
            onCommitCreate={handleCommitCreate}
            onCancelCreate={handleCancelCreate}
            onFileOpen={handleOpenFile}
            onRename={handleRename}
            onDelete={handleDeleteNode}
          />
        </div>
      </div>

      <EditorPanel
        openTabs={openTabs}
        activeTabId={activeEditorTabId}
        isDarkMode={darkMode}
        onTabSelect={setActiveTabId}
        onTabClose={handleCloseTab}
        onContentChange={handleContentChange}
      />
    </main>
  );
}
