import { FileNode } from "../types/fileTree";

function normalizeNodeName(name: string): string {
    return name.trim().toLowerCase();
}

export function orderTreeNodes(tree: FileNode[]): FileNode[] {
    return [...tree]
        .map((node) =>
            node.children
                ? {
                    ...node,
                    children: orderTreeNodes(node.children),
                }
                : node
        )
        .sort((first, second) => {
            if (first.type === second.type) {
                return 0;
            }

            return first.type === "folder" ? -1 : 1;
        });
}

export function getCreateInsertIndex(
    tree: FileNode[],
    type: FileNode["type"]
): number {
    if (type === "file") {
        return tree.length;
    }

    const firstFileIndex = tree.findIndex((node) => node.type === "file");

    return firstFileIndex === -1 ? tree.length : firstFileIndex;
}

export function addNode(tree: FileNode[], folderId: string, newNode: FileNode): FileNode[] {
    let changed = false;

    const nextTree = tree.map((node) => {
        if (node.id === folderId && node.type === "folder") {
            const children = node.children || [];
            const hasDuplicate = children.some(
                (child) =>
                    normalizeNodeName(child.name) ===
                    normalizeNodeName(newNode.name)
            );

            if (hasDuplicate || !normalizeNodeName(newNode.name)) {
                return node;
            }

            changed = true;

            return {
                ...node,
                isOpen: true,
                children: orderTreeNodes([...children, newNode]),
            };
        }

        if (node.children) {
            const children = addNode(node.children, folderId, newNode);

            if (children !== node.children) {
                changed = true;

                return {
                    ...node,
                    children,
                };
            }
        }

        return node;
    });

    return changed ? nextTree : tree;
}

export function expandFolder(tree: FileNode[], folderId: string): FileNode[] {
    let changed = false;

    const nextTree = tree.map((node) => {
        if (node.id === folderId && node.type === "folder") {
            if (node.isOpen) {
                return node;
            }

            changed = true;

            return {
                ...node,
                isOpen: true,
            };
        }

        if (node.children) {
            const children = expandFolder(node.children, folderId);

            if (children !== node.children) {
                changed = true;

                return {
                    ...node,
                    children,
                };
            }
        }

        return node;
    });

    return changed ? nextTree : tree;
}

export function findFirstFolderId(tree: FileNode[]): string | null {
    for (const node of tree) {
        if (node.type === "folder") {
            return node.id;
        }

        if (node.children) {
            const folderId = findFirstFolderId(node.children);

            if (folderId) {
                return folderId;
            }
        }
    }

    return null;
}

export function deleteNode(tree: FileNode[], nodeId: string): FileNode[] {
    let changed = false;
    const nextTree: FileNode[] = [];

    for (const node of tree) {
        if (node.id === nodeId) {
            changed = true;
            continue;
        }

        if (node.children) {
            const children = deleteNode(node.children, nodeId);

            if (children !== node.children) {
                changed = true;
                nextTree.push({
                    ...node,
                    children,
                });
                continue;
            }
        }

        nextTree.push(node);
    }

    return changed ? nextTree : tree;
}

export function renameNode(tree: FileNode[], nodeId: string, newName: string): FileNode[] {
    let changed = false;
    const trimmedName = newName.trim();

    if (!trimmedName) {
        return tree;
    }

    const nextTree = tree.map((node) => {
        if (node.id === nodeId) {
            if (node.name === trimmedName) {
                return node;
            }

            changed = true;

            return {
                ...node,
                name: trimmedName,
            };
        }

        if (node.children) {
            const children = renameNode(node.children, nodeId, trimmedName);

            if (children !== node.children) {
                changed = true;

                return {
                    ...node,
                    children,
                };
            }
        }

        return node;
    });

    return changed ? nextTree : tree;
}

export function updateFileContent(
    tree: FileNode[],
    fileId: string,
    content: string
): FileNode[] {
    let changed = false;

    const nextTree = tree.map((node) => {
        if (node.id === fileId && node.type === "file") {
            if ((node.content || "") === content) {
                return node;
            }

            changed = true;

            return {
                ...node,
                content,
            };
        }

        if (node.children) {
            const children = updateFileContent(
                node.children,
                fileId,
                content
            );

            if (children !== node.children) {
                changed = true;

                return {
                    ...node,
                    children,
                };
            }
        }

        return node;
    });

    return changed ? nextTree : tree;
}

export function toggleFolder(tree: FileNode[], folderId: string): FileNode[] {
    let changed = false;

    const nextTree = tree.map((node) => {
        if (node.id === folderId && node.type === "folder") {
            changed = true;

            return {
                ...node,
                isOpen: !node.isOpen,
            };
        }

        if (node.children) {
            const children = toggleFolder(node.children, folderId);

            if (children !== node.children) {
                changed = true;

                return {
                    ...node,
                    children,
                };
            }
        }

        return node;
    });

    return changed ? nextTree : tree;
}

export function countDescendants(node: FileNode): number {
    return (node.children || []).reduce(
        (total, child) => total + 1 + countDescendants(child),
        0
    );
}

export function findNode(tree: FileNode[], nodeId: string): FileNode | null {
    for (const node of tree) {
        if (node.id === nodeId) {
            return node;
        }

        if (node.children) {
            const found = findNode(node.children, nodeId);

            if (found) {
                return found;
            }
        }
    }

    return null;
}

export function findParentFolderId(
    tree: FileNode[],
    nodeId: string,
    parentFolderId: string | null = null
): string | null | undefined {
    for (const node of tree) {
        if (node.id === nodeId) {
            return parentFolderId;
        }

        if (node.children) {
            const found = findParentFolderId(
                node.children,
                nodeId,
                node.id
            );

            if (found !== undefined) {
                return found;
            }
        }
    }

    return undefined;
}

export function getFolderChildren(
    tree: FileNode[],
    folderId: string | null
): FileNode[] | null {
    if (!folderId) {
        return tree;
    }

    const folder = findNode(tree, folderId);

    if (folder?.type !== "folder") {
        return null;
    }

    return folder.children || [];
}

export function hasNodeNameInFolder(
    tree: FileNode[],
    folderId: string | null,
    name: string,
    excludeNodeId?: string
): boolean {
    const children = getFolderChildren(tree, folderId);
    const normalizedName = normalizeNodeName(name);

    if (!children || !normalizedName) {
        return false;
    }

    return children.some(
        (child) =>
            child.id !== excludeNodeId &&
            normalizeNodeName(child.name) === normalizedName
    );
}

export function collectNodeIds(node: FileNode): string[] {
    return [
        node.id,
        ...(node.children || []).flatMap((child) =>
            collectNodeIds(child)
        ),
    ];
}

export function insertNode(tree: FileNode[], targetId: string, newNode: FileNode): FileNode[] {
    let changed = false;
    const result: FileNode[] = [];

    for (const node of tree) {
        result.push(node);

        if (node.id === targetId) {
            result.push(newNode);
            changed = true;
            continue;
        }

        if (node.children) {
            const children = insertNode(
                node.children,
                targetId,
                newNode
            );

            if (children !== node.children) {
                changed = true;
                result[result.length - 1] = {
                    ...node,
                    children,
                };
            }
        }
    }

    return changed ? result : tree;
}
