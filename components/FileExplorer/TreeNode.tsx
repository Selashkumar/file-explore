"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  File,
  Folder,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import ContextMenu from "./ContextMenu";
import {
  FileNode,
  FileType,
  PendingCreateNode,
} from "./types/fileTree";
import {
  countDescendants,
  getCreateInsertIndex,
} from "./utils/fileTree";


interface TreeNodeProps {
  node: FileNode;

  parentFolderId?: string | null;

  level?: number;

  selectedId?: string;

  renamingId: string | null;

  renameValue: string;

  deleteConfirmId: string | null;

  creating: PendingCreateNode | null;

  createValue: string;

  createError: string;

  onToggle: (folderId: string) => void;

  onCreate: (
    type: "file" | "folder",
    folderId?: string | null
  ) => void;

  onCreateValueChange: (value: string) => void;

  onCommitCreate: () => void;

  onCancelCreate: () => void;

  onSelect?: (
    node: FileNode,
    options?: {
      openFile?: boolean;
    }
  ) => void;

  onStartRename: (node: FileNode) => void;

  onRenameValueChange: (value: string) => void;

  onCommitRename: (nodeId: string) => void;

  onCancelOperation: () => void;

  onRequestDelete: (nodeId: string) => void;

  onConfirmDelete: (nodeId: string) => void;
}

export default function TreeNode({
  node,
  parentFolderId = null,
  level = 0,
  selectedId,
  renamingId,
  renameValue,
  deleteConfirmId,
  creating,
  createValue,
  createError,
  onToggle,
  onCreate,
  onCreateValueChange,
  onCommitCreate,
  onCancelCreate,
  onSelect,
  onStartRename,
  onRenameValueChange,
  onCommitRename,
  onCancelOperation,
  onRequestDelete,
  onConfirmDelete,
}: TreeNodeProps) {
  const [contextMenu, setContextMenu] =
    useState<{
      x: number;
      y: number;
    } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const isFolder = node.type === "folder";

  const isSelected = selectedId === node.id;

  const isEditing = renamingId === node.id;

  const isDeleteConfirmOpen = deleteConfirmId === node.id;

  const childCount = countDescendants(node);

  const targetFolderId = isFolder
    ? node.id
    : parentFolderId;

  const childNodes = node.children || [];
  const isCreatingInThisFolder =
    isFolder && creating?.parentFolderId === node.id;
  const childCreateIndex = isCreatingInThisFolder
    ? getCreateInsertIndex(childNodes, creating.type)
    : -1;

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (isFolder) {
      onToggle(node.id);
    }

    onSelect?.(node, {
      openFile: !isFolder,
    });
  };

  const handleContextMenu = (
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    onSelect?.(node);

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleStartRename = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    onStartRename(node);
  };

  const handleRequestDelete = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    onRequestDelete(node.id);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={`vscode-tree-row group ${
          isSelected ? "is-selected" : ""
        }`}
        style={{
          paddingLeft: `${level * 14 + 8}px`,
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isFolder ? (
            node.isOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )
          ) : (
            <div className="w-4" />
          )}

          {isFolder ? (
            <Folder
              size={16}
              className="shrink-0"
              style={{
                color: "var(--folder-color)",
              }}
            />
          ) : (
            <File
              size={16}
              className="shrink-0"
              style={{
                color: "var(--file-color)",
              }}
            />
          )}

          {isEditing ? (
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) =>
                onRenameValueChange(e.target.value)
              }
              onBlur={() => onCommitRename(node.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onCommitRename(node.id);
                }

                if (e.key === "Escape") {
                  onCancelOperation();
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="vscode-input px-1 py-0.5 text-sm"
            />
          ) : (
            <span className="truncate text-sm">
              {node.name}
            </span>
          )}
        </div>

        {!isEditing && (
          <div
            className="vscode-tree-actions"
          >
            <button
              aria-label={`Rename ${node.name}`}
              title="Rename"
              onClick={handleStartRename}
              className="vscode-action-button"
            >
              Rename
            </button>

            <button
              aria-label={`Delete ${node.name}`}
              title="Delete"
              onClick={handleRequestDelete}
              className="vscode-action-button vscode-action-button-danger"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onNewFile={() =>
            onCreate("file", targetFolderId)
          }
          onNewFolder={() =>
            onCreate("folder", targetFolderId)
          }
          onRename={() => onStartRename(node)}
          onDelete={() => onRequestDelete(node.id)}
        />
      )}

      {isDeleteConfirmOpen && (
        <div
          className="vscode-modal-backdrop"
        >
          <div
            className="vscode-modal"
          >
            <h3 className="text-sm font-semibold mb-2">
              Delete &quot;{node.name}&quot;?
            </h3>

            <p
              className="text-sm mb-5"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {childCount > 0 ? (
                <>
                  This folder contains{" "}
                  <strong>{childCount}</strong>{" "}
                  item{childCount > 1 ? "s" : ""}.
                  <br />
                  Deleting it will remove all nested files
                  and folders.
                </>
              ) : (
                "This action cannot be undone."
              )}
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={onCancelOperation}
                className="vscode-button"
              >
                Cancel
              </button>

              <button
                onClick={() => onConfirmDelete(node.id)}
                className="vscode-button vscode-button-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isFolder &&
        node.isOpen &&
        childNodes && (
          <div>
            {childNodes.map((child, index) => (
              <Fragment key={child.id}>
                {index === childCreateIndex && (
                  <CreateTreeRow
                    type={creating?.type ?? "file"}
                    level={level + 1}
                    value={createValue}
                    error={createError}
                    onValueChange={onCreateValueChange}
                    onCommit={onCommitCreate}
                    onCancel={onCancelCreate}
                  />
                )}

                <TreeNode
                  node={child}
                  parentFolderId={
                    isFolder ? node.id : parentFolderId
                  }
                  level={level + 1}
                  selectedId={selectedId}
                  renamingId={renamingId}
                  renameValue={renameValue}
                  deleteConfirmId={deleteConfirmId}
                  creating={creating}
                  createValue={createValue}
                  createError={createError}
                  onToggle={onToggle}
                  onCreate={onCreate}
                  onCreateValueChange={onCreateValueChange}
                  onCommitCreate={onCommitCreate}
                  onCancelCreate={onCancelCreate}
                  onSelect={onSelect}
                  onStartRename={onStartRename}
                  onRenameValueChange={onRenameValueChange}
                  onCommitRename={onCommitRename}
                  onCancelOperation={onCancelOperation}
                  onRequestDelete={onRequestDelete}
                  onConfirmDelete={onConfirmDelete}
                />
              </Fragment>
            ))}

            {childCreateIndex === childNodes.length && (
              <CreateTreeRow
                type={creating?.type ?? "file"}
                level={level + 1}
                value={createValue}
                error={createError}
                onValueChange={onCreateValueChange}
                onCommit={onCommitCreate}
                onCancel={onCancelCreate}
              />
            )}
          </div>
        )}
    </div>
  );
}

interface CreateTreeRowProps {
  type: FileType;
  level: number;
  value: string;
  error: string;
  onValueChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

export function CreateTreeRow({
  type,
  level,
  value,
  error,
  onValueChange,
  onCommit,
  onCancel,
}: CreateTreeRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handledRef = useRef(false);
  const isFolder = type === "folder";

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    if (error) {
      inputRef.current?.focus();
    }
  }, [error]);

  useEffect(() => {
    handledRef.current = false;
  }, [error, value]);

  const commit = () => {
    if (handledRef.current) return;

    handledRef.current = true;
    onCommit();
    window.setTimeout(() => {
      handledRef.current = false;
    }, 0);
  };

  const cancel = () => {
    if (handledRef.current) return;

    handledRef.current = true;
    onCancel();
    window.setTimeout(() => {
      handledRef.current = false;
    }, 0);
  };

  return (
    <div className="vscode-tree-create">
      <div
        className="vscode-tree-row vscode-tree-create-row"
        style={{
          paddingLeft: `${level * 14 + 8}px`,
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-4" />

          {isFolder ? (
            <Folder
              size={16}
              className="shrink-0"
              style={{
                color: "var(--folder-color)",
              }}
            />
          ) : (
            <File
              size={16}
              className="shrink-0"
              style={{
                color: "var(--file-color)",
              }}
            />
          )}

          <input
            ref={inputRef}
            value={value}
            onChange={(event) =>
              onValueChange(event.target.value)
            }
            onBlur={() => {
              if (error) {
                window.setTimeout(() => {
                  inputRef.current?.focus();
                }, 0);
                return;
              }

              if (value.trim()) {
                commit();
              } else {
                cancel();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                cancel();
              }
            }}
            onClick={(event) => event.stopPropagation()}
            placeholder={
              isFolder ? "New folder" : "New file"
            }
            className={`vscode-input vscode-tree-create-input ${
              error ? "is-error" : ""
            }`}
          />
        </div>
      </div>

      {error && (
        <p
          className="vscode-inline-error"
          style={{
            paddingLeft: `${level * 14 + 44}px`,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
