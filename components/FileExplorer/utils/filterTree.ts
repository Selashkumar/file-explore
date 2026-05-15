import { FileNode } from "../types/fileTree";

export function filterTree(
  tree: FileNode[],
  query: string
): FileNode[] {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return tree;
  }

  const lowerQuery = trimmedQuery.toLowerCase();

  return tree.reduce<FileNode[]>((matches, node) => {
    const selfMatches = node.name
      .toLowerCase()
      .includes(lowerQuery);

    const filteredChildren = node.children
      ? filterTree(node.children, trimmedQuery)
      : undefined;

    const hasMatchingChildren =
      !!filteredChildren && filteredChildren.length > 0;

    if (selfMatches || hasMatchingChildren) {
      matches.push({
        ...node,
        isOpen: hasMatchingChildren ? true : node.isOpen,
        children: filteredChildren,
      });
    }

    return matches;
  }, []);
}
