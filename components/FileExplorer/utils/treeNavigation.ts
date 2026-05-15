import { FileNode } from "../types/fileTree";

export interface VisibleNode {
  node: FileNode;
  level: number;
}

export function flattenVisibleTree(
  tree: FileNode[],
  level = 0
): VisibleNode[] {
  const result: VisibleNode[] = [];

  for (const node of tree) {
    result.push({
      node,
      level,
    });

    if (
      node.type === "folder" &&
      node.isOpen &&
      node.children
    ) {
      result.push(
        ...flattenVisibleTree(node.children, level + 1)
      );
    }
  }

  return result;
}
