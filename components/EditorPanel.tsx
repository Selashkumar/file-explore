"use client";

import dynamic from "next/dynamic";
import type { EditorProps } from "@monaco-editor/react";
import { File, X } from "lucide-react";

import { FileNode } from "./FileExplorer/types/fileTree";

const MonacoEditor = dynamic<EditorProps>(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="vscode-editor-loading">
        Loading editor...
      </div>
    ),
  }
);

interface EditorPanelProps {
  openTabs: FileNode[];
  activeTabId: string | null;
  isDarkMode: boolean;
  onTabSelect: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
  onContentChange: (fileId: string, content: string) => void;
}

function getLanguage(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "css":
      return "css";
    case "html":
      return "html";
    case "json":
      return "json";
    case "md":
    case "mdx":
      return "markdown";
    default:
      return "plaintext";
  }
}

export default function EditorPanel({
  openTabs,
  activeTabId,
  isDarkMode,
  onTabSelect,
  onTabClose,
  onContentChange,
}: EditorPanelProps) {
  const activeFile =
    openTabs.find((tab) => tab.id === activeTabId) ?? null;

  return (
    <section className="vscode-editor-panel">
      <div className="vscode-tabs" role="tablist">
        {openTabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              className={`vscode-tab ${
                isActive ? "is-active" : ""
              }`}
              role="presentation"
            >
              <button
                type="button"
                className="vscode-tab-select"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabSelect(tab.id)}
              >
                <File
                  size={14}
                  style={{
                    color: "var(--file-color)",
                  }}
                />

                <span className="vscode-tab-name">
                  {tab.name}
                </span>
              </button>

              <button
                type="button"
                aria-label={`Close ${tab.name}`}
                title="Close"
                className="vscode-tab-close"
                onClick={(event) => {
                  event.stopPropagation();
                  onTabClose(tab.id);
                }}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="vscode-editor-content">
        {activeFile ? (
          <MonacoEditor
            key={activeFile.id}
            path={activeFile.id}
            language={getLanguage(activeFile.name)}
            theme={isDarkMode ? "vs-dark" : "light"}
            value={activeFile.content ?? ""}
            onChange={(value) =>
              onContentChange(activeFile.id, value ?? "")
            }
            options={{
              automaticLayout: true,
              fontFamily:
                'Menlo, Consolas, "Liberation Mono", monospace',
              fontSize: 13,
              minimap: {
                enabled: false,
              },
              scrollBeyondLastLine: false,
              tabSize: 2,
              wordWrap: "on",
            }}
          />
        ) : (
          <div className="vscode-editor-empty">
            No file open
          </div>
        )}
      </div>
    </section>
  );
}
