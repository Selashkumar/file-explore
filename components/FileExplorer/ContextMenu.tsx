"use client";

import { useEffect, useRef } from "react";
import {
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export default function ContextMenu({
  x,
  y,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="vscode-context-menu"
      style={{
        left: x,
        top: y,
      }}
    >
      <button
        type="button"
        onClick={() => handleAction(onNewFile)}
        className="vscode-context-menu-item"
      >
        <FilePlus size={15} />
        <span>New File</span>
      </button>

      <button
        type="button"
        onClick={() => handleAction(onNewFolder)}
        className="vscode-context-menu-item"
      >
        <FolderPlus size={15} />
        <span>New Folder</span>
      </button>

      {(onRename || onDelete) && (
        <div className="vscode-context-menu-divider" />
      )}

      {onRename && (
        <button
          type="button"
          onClick={() => handleAction(onRename)}
          className="vscode-context-menu-item"
        >
          <Pencil size={15} />
          <span>Rename</span>
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={() => handleAction(onDelete)}
          className="vscode-context-menu-item vscode-context-menu-danger"
        >
          <Trash2 size={15} />
          <span>Delete</span>
        </button>
      )}
    </div>
  );
}
