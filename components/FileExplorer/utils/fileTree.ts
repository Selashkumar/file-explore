import { FileNode } from "../types/fileTree";

// ADD NODE
export function addNode(tree: FileNode[], folderId: string, newNode: FileNode): FileNode[] {
    return tree.map((node) => {
        // target folder found
        if (node.id === folderId && node.type === "folder") {
            return {
                ...node,
                isOpen: true,
                children: [...(node.children || []), newNode],
            };
        }

        // recursive search
        if (node.children) {
            return {
                ...node,
                children: addNode(node.children, folderId, newNode),
            };
        }

        return node;
    });
}

// DELETE NODE
export function deleteNode(tree: FileNode[], nodeId: string): FileNode[] {
    return tree
        .filter((node) => node.id !== nodeId)
        .map((node) => {
            if (node.children) {
                return {
                    ...node,
                    children: deleteNode(node.children, nodeId),
                };
            }

            return node;
        });
}

// RENAME NODE
export function renameNode(tree: FileNode[], nodeId: string, newName: string): FileNode[] {
    return tree.map((node) => {
        if (node.id === nodeId) {
            return {
                ...node,
                name: newName,
            };
        }

        if (node.children) {
            return {
                ...node,
                children: renameNode(node.children, nodeId, newName),
            };
        }

        return node;
    });
}

// TOGGLE FOLDER
export function toggleFolder(tree: FileNode[], folderId: string): FileNode[] {
    return tree.map((node) => {
        if (node.id === folderId && node.type === "folder") {
            return {
                ...node,
                isOpen: !node.isOpen,
            };
        }

        if (node.children) {
            return {
                ...node,
                children: toggleFolder(node.children, folderId),
            };
        }

        return node;
    });
}

// FIND NODE
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

// INSERT NODE BEFORE / AFTER
export function insertNode(tree: FileNode[], targetId: string, newNode: FileNode): FileNode[] {
    const result: FileNode[] = [];

    for (const node of tree) {
        result.push(node);

        if (node.id === targetId) {
            result.push(newNode);
        }

        if (node.children) {
            node.children = insertNode(
                node.children,
                targetId,
                newNode
            );
        }
    }

    return result;
}