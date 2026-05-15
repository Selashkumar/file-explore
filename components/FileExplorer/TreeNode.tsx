"use client";

import { useEffect, useRef, useState } from "react";

import {
  File,
  Folder,
  ChevronRight,
  ChevronDown,
  Pencil,
} from "lucide-react";
import { FileNode } from "./types/fileTree";


interface TreeNodeProps {
  node: FileNode;

  level?: number;

  selectedId?: string;

  onToggle: (folderId: string) => void;

  onSelect?: (node: FileNode) => void;

  // rename callback
  onRename: (
    nodeId: string,
    newName: string
  ) => void;
}

export default function TreeNode({
  node,
  level = 0,
  selectedId,
  onToggle,
  onSelect,
  onRename,
}: TreeNodeProps) {
  // =========================
  // STATES
  // =========================

  const [isEditing, setIsEditing] =
    useState(false);

  const [editValue, setEditValue] =
    useState(node.name);

  const inputRef = useRef<HTMLInputElement>(null);

  const isFolder = node.type === "folder";

  const isSelected = selectedId === node.id;

  // =========================
  // AUTO FOCUS
  // =========================

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();

      inputRef.current?.select();
    }
  }, [isEditing]);

  // =========================
  // NODE CLICK
  // =========================

  const handleClick = () => {
    if (isFolder) {
      onToggle(node.id);
    }

    onSelect?.(node);
  };

  // =========================
  // START RENAME
  // =========================

  const handleStartRename = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    setEditValue(node.name);

    setIsEditing(true);
  };

  // =========================
  // SAVE RENAME
  // =========================

  const handleSaveRename = () => {
    const trimmed = editValue.trim();

    if (!trimmed) {
      setEditValue(node.name);

      setIsEditing(false);

      return;
    }

    onRename(node.id, trimmed);

    setIsEditing(false);
  };

  return (
    <div>
      {/* NODE */}
      <div
        onClick={handleClick}
        className={`
          flex items-center justify-between
          gap-2
          px-2 py-1
          cursor-pointer
          hover:bg-neutral-800
          rounded
          group
          ${isSelected ? "bg-neutral-800" : ""}
        `}
        style={{
          paddingLeft: `${level * 14 + 8}px`,
        }}
      >
        {/* LEFT */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* CHEVRON */}
          {isFolder ? (
            node.isOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )
          ) : (
            <div className="w-4" />
          )}

          {/* ICON */}
          {isFolder ? (
            <Folder
              size={16}
              className="text-yellow-400 shrink-0"
            />
          ) : (
            <File
              size={16}
              className="text-blue-400 shrink-0"
            />
          )}

          {/* LABEL / INPUT */}
          {isEditing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) =>
                setEditValue(e.target.value)
              }
              onBlur={handleSaveRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveRename();
                }

                if (e.key === "Escape") {
                  setEditValue(node.name);

                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="
                bg-neutral-700
                border border-blue-500
                rounded
                px-1 py-0.5
                outline-none
                text-sm
                w-full
              "
            />
          ) : (
            <span className="truncate text-sm">
              {node.name}
            </span>
          )}
        </div>

        {/* RENAME BUTTON */}
        {!isEditing && (
          <button
            onClick={handleStartRename}
            className="
              opacity-0
              group-hover:opacity-100
              transition
              p-1
              hover:bg-neutral-700
              rounded
            "
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {/* CHILDREN */}
      {isFolder &&
        node.isOpen &&
        node.children && (
          <div>
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                selectedId={selectedId}
                onToggle={onToggle}
                onSelect={onSelect}
                onRename={onRename}
              />
            ))}
          </div>
        )}
    </div>
  );
}