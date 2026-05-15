"use client";

import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { FolderOpen } from "lucide-react";

import TreeNode, { CreateTreeRow } from "./TreeNode";
import ContextMenu from "./ContextMenu";
import {
    FileNode,
    PendingCreateNode,
} from "./types/fileTree";
import { flattenVisibleTree } from "./utils/treeNavigation";
import { getCreateInsertIndex } from "./utils/fileTree";


interface TreeProps {
    treeNode: FileNode[];

    keyboardEnabled?: boolean;

    emptyTitle?: string;

    emptyDescription?: string;

    creating?: PendingCreateNode | null;

    createValue?: string;

    createError?: string;

    onFolderSelect?: (
      folderId: string
    ) => void;

    onClearSelection?: () => void;

    onToggle: (
      folderId: string
    ) => void;

    onCreate: (
      type: "file" | "folder",
      folderId?: string | null
    ) => void;

    onCreateValueChange?: (value: string) => void;

    onCommitCreate?: () => void;

    onCancelCreate?: () => void;

    onFileOpen?: (
      fileId: string
    ) => void;

    onRename: (
      nodeId: string,
      newName: string
    ) => void;

    onDelete: (
      nodeId: string
    ) => void;
  }

export default function Tree({
    treeNode,
    keyboardEnabled = true,
    emptyTitle = "No files or folders",
    emptyDescription = "Create a new file or folder",
    creating = null,
    createValue = "",
    createError = "",
    onFolderSelect,
    onClearSelection,
    onToggle,
    onCreate,
    onCreateValueChange,
    onCommitCreate,
    onCancelCreate,
    onFileOpen,
    onRename,
    onDelete,
}: TreeProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [renamingId, setRenamingId] = useState<string | null>(null);

    const [renameValue, setRenameValue] = useState("");

    const [deleteConfirmId, setDeleteConfirmId] =
        useState<string | null>(null);

    const [rootContextMenu, setRootContextMenu] =
        useState<{
            x: number;
            y: number;
        } | null>(null);

    const visibleNodes = useMemo(
        () => flattenVisibleTree(treeNode),
        [treeNode]
    );

    const effectiveSelectedId =
        selectedId &&
        visibleNodes.some(({ node }) => node.id === selectedId)
            ? selectedId
            : null;

    const selectNode = useCallback(
        (
            node: FileNode,
            options?: {
                openFile?: boolean;
            }
        ) => {
            setSelectedId(node.id);

            if (node.type === "folder") {
                onFolderSelect?.(node.id);
                return;
            }

            onClearSelection?.();

            if (options?.openFile) {
                onFileOpen?.(node.id);
            }
        },
        [onClearSelection, onFileOpen, onFolderSelect]
    );

    const startRename = useCallback((node: FileNode) => {
        onCancelCreate?.();
        setDeleteConfirmId(null);
        setRenameValue(node.name);
        setRenamingId(node.id);
    }, [onCancelCreate]);

    const requestDelete = useCallback((nodeId: string) => {
        onCancelCreate?.();
        setRenamingId(null);
        setDeleteConfirmId(nodeId);
    }, [onCancelCreate]);

    const cancelOperation = useCallback(() => {
        setRenamingId(null);
        setRenameValue("");
        setDeleteConfirmId(null);
        onCancelCreate?.();
    }, [onCancelCreate]);

    const clearSelection = useCallback(() => {
        setSelectedId(null);
        cancelOperation();
        onClearSelection?.();
    }, [cancelOperation, onClearSelection]);

    const isTreeRowEvent = (target: EventTarget | null) =>
        target instanceof HTMLElement &&
        !!target.closest(".vscode-tree-row, .vscode-context-menu");

    const handleRootClick = (
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        if (isTreeRowEvent(event.target)) {
            return;
        }

        clearSelection();
        setRootContextMenu(null);
    };

    const handleRootContextMenu = (
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        if (isTreeRowEvent(event.target)) {
            return;
        }

        event.preventDefault();
        clearSelection();
        setRootContextMenu({
            x: event.clientX,
            y: event.clientY,
        });
    };

    const commitRename = useCallback(
        (nodeId: string) => {
            const trimmed = renameValue.trim();

            if (trimmed) {
                onRename(nodeId, trimmed);
            }

            setRenamingId(null);
            setRenameValue("");
        },
        [onRename, renameValue]
    );

    const confirmDelete = useCallback(
        (nodeId: string) => {
            onDelete(nodeId);
            setDeleteConfirmId(null);
        },
        [onDelete]
    );

    useEffect(() => {
        if (!keyboardEnabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }

            const activeElement = document.activeElement;

            if (
                activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLTextAreaElement ||
                (
                    activeElement instanceof HTMLElement &&
                    !!activeElement.closest(".monaco-editor")
                )
            ) {
                if (event.key === "Escape") {
                    event.preventDefault();
                    cancelOperation();
                }

                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                cancelOperation();
                return;
            }

            if (visibleNodes.length === 0) {
                return;
            }

            if (!effectiveSelectedId) {
                if (event.key === "ArrowDown") {
                    event.preventDefault();
                    selectNode(visibleNodes[0].node);
                    return;
                }

                if (event.key === "ArrowUp") {
                    event.preventDefault();
                    selectNode(visibleNodes[visibleNodes.length - 1].node);
                    return;
                }

                return;
            }

            const currentIndex = visibleNodes.findIndex(
                ({ node }) => node.id === effectiveSelectedId
            );

            const current = visibleNodes[currentIndex];

            if (!current) return;

            if (event.key === "ArrowDown") {
                event.preventDefault();

                const next = visibleNodes[currentIndex + 1];

                if (next) {
                    selectNode(next.node);
                }

                return;
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();

                const previous = visibleNodes[currentIndex - 1];

                if (previous) {
                    selectNode(previous.node);
                }

                return;
            }

            if (event.key === "ArrowRight") {
                if (
                    current.node.type === "folder" &&
                    !current.node.isOpen
                ) {
                    event.preventDefault();
                    onToggle(current.node.id);
                }

                return;
            }

            if (event.key === "ArrowLeft") {
                if (
                    current.node.type === "folder" &&
                    current.node.isOpen
                ) {
                    event.preventDefault();
                    onToggle(current.node.id);
                }

                return;
            }

            if (event.key === "Enter") {
                event.preventDefault();
                startRename(current.node);
                return;
            }

            if (event.key === "Delete") {
                event.preventDefault();
                requestDelete(current.node.id);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () =>
            window.removeEventListener("keydown", handleKeyDown);
    }, [
        cancelOperation,
        effectiveSelectedId,
        keyboardEnabled,
        onToggle,
        requestDelete,
        selectNode,
        startRename,
        visibleNodes,
    ]);

    const renderCreateRow = (level: number) => (
        <CreateTreeRow
            type={creating?.type ?? "file"}
            level={level}
            value={createValue}
            error={createError}
            onValueChange={onCreateValueChange ?? (() => undefined)}
            onCommit={onCommitCreate ?? (() => undefined)}
            onCancel={onCancelCreate ?? (() => undefined)}
        />
    );

    const isCreatingAtRoot = creating?.parentFolderId === null;
    const rootCreateIndex = isCreatingAtRoot
        ? getCreateInsertIndex(treeNode, creating.type)
        : -1;

    const rootContextMenuElement = rootContextMenu && (
        <ContextMenu
            x={rootContextMenu.x}
            y={rootContextMenu.y}
            onClose={() => setRootContextMenu(null)}
            onNewFile={() => onCreate("file", null)}
            onNewFolder={() => onCreate("folder", null)}
        />
    );

    if (treeNode.length === 0 && !isCreatingAtRoot) {
        return (
            <div
                className="vscode-tree w-full h-full"
                onClick={handleRootClick}
                onContextMenu={handleRootContextMenu}
            >
                <div className="vscode-empty-state">
                    <FolderOpen
                        size={34}
                        strokeWidth={1.5}
                    />

                    <p className="text-sm font-medium">
                        {emptyTitle}
                    </p>

                    <p className="text-xs">
                        {emptyDescription}
                    </p>
                </div>

                {rootContextMenuElement}
            </div>
        );
    }

    return (
        <div
            className="vscode-tree w-full h-full"
            onClick={handleRootClick}
            onContextMenu={handleRootContextMenu}
        >
            {treeNode.map((node, index) => (
                <Fragment key={node.id}>
                    {index === rootCreateIndex && renderCreateRow(0)}

                    <TreeNode
                        node={node}
                        parentFolderId={null}
                        selectedId={effectiveSelectedId || undefined}
                        renamingId={renamingId}
                        renameValue={renameValue}
                        deleteConfirmId={deleteConfirmId}
                        creating={creating}
                        createValue={createValue}
                        createError={createError}
                        onToggle={onToggle}
                        onCreate={onCreate}
                        onCreateValueChange={
                            onCreateValueChange ?? (() => undefined)
                        }
                        onCommitCreate={
                            onCommitCreate ?? (() => undefined)
                        }
                        onCancelCreate={
                            onCancelCreate ?? (() => undefined)
                        }
                        onSelect={selectNode}
                        onStartRename={startRename}
                        onRenameValueChange={setRenameValue}
                        onCommitRename={commitRename}
                        onCancelOperation={cancelOperation}
                        onRequestDelete={requestDelete}
                        onConfirmDelete={confirmDelete}
                    />
                </Fragment>
            ))}

            {rootCreateIndex === treeNode.length && renderCreateRow(0)}

            {rootContextMenuElement}
        </div>
    );
}
