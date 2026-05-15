import { FileNode } from "@/components/FileExplorer/types/fileTree";

export const initialTree: FileNode[] = [
    {
      id: "1",
      name: "app",
      type: "folder",
      isOpen: true,
      children: [
        {
          id: "2",
          name: "page.tsx",
          type: "file",
        },
        {
          id: "3",
          name: "layout.tsx",
          type: "file",
        },
      ],
    },
    {
      id: "4",
      name: "components",
      type: "folder",
      isOpen: false,
      children: [],
    },
  ];