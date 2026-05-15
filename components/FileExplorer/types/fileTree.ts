export type FileType = "file" | "folder";

export interface PendingCreateNode {
  type: FileType;
  parentFolderId: string | null;
}

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  // only folders use this
  children?: FileNode[];
  // VS Code expand / collapse
  isOpen?: boolean;
  // only files use this
  content?: string;
}
