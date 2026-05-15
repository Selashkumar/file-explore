# VS Code Explorer

A VS Code-inspired file explorer and browser-based editor built with Next.js, React, TypeScript, Tailwind CSS, and Monaco Editor.

The app provides an IDE-style interface where users can create files and folders, browse a nested tree, open files in tabs, edit file content, search the explorer, and persist the tree locally in the browser.

## Features

- VS Code-style dark and light themes
- Recursive file and folder tree
- VS Code-style inline file and folder creation
- Folders stay above files in every folder
- Click blank explorer space to clear folder selection and create at the root
- Right-click blank explorer space to create root files or folders
- Prevent empty names and duplicate sibling names
- Rename files and folders inline
- Delete files and folders with confirmation
- Recursive folder deletion, including nested children
- Expand and collapse folders
- Search/filter tree by file or folder name
- Show parent folders for matching nested files
- Empty-state hint when no files or folders exist
- Right-click context menu with New File, New Folder, Rename, and Delete
- Keyboard navigation for visible tree nodes
- Multi-tab file editor
- Closeable editor tabs
- Monaco Editor integration
- Per-file editor content stored in tree state
- localStorage persistence for the file tree and file content

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Monaco Editor via `@monaco-editor/react`
- Lucide React icons
- Browser `localStorage`

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app:

```txt
http://localhost:3000
```

If port `3000` is already in use, Next.js may choose another available port.

## Build For Production

Create a production build:

```bash
npm run build
```

Start the production server after building:

```bash
npm start
```

## Storebox Submission Notes

- This project uses custom recursive React components for the file tree.
- No ready-made file-tree packages such as `react-arborist`, `rc-tree`, or `react-complex-tree` are used.
- LLM assistance was used and documented in `chat-history.md`, including the shared ChatGPT transcript link requested by the assignment.
- Recommended deployment target: Vercel.

Deploy with Vercel:

```bash
npm install
npm run build
```

Then import the repository into Vercel and use the default Next.js settings.

Create a source zip for submission from the project root:

```bash
zip -r storebox-file-explorer-submission.zip . \
  -x "node_modules" "node_modules/*" \
     ".next" ".next/*" \
     ".git" ".git/*" \
     ".vercel" ".vercel/*" \
     ".turbo" ".turbo/*" \
     "*.zip" ".DS_Store"
```

The zip should include source code, `package.json`, `package-lock.json`, `README.md`, and `chat-history.md`.

## Folder Structure

```txt
file-explore/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── EditorPanel.tsx
│   └── FileExplorer/
│       ├── ContextMenu.tsx
│       ├── FileTree.tsx
│       ├── Tree.tsx
│       ├── TreeNode.tsx
│       ├── types/
│       │   └── fileTree.ts
│       └── utils/
│           ├── fileTree.ts
│           ├── filterTree.ts
│           └── treeNavigation.ts
├── data/
│   └── initialTree.ts
├── public/
├── chat-history.md
├── package.json
└── README.md
```

## Folder Structure Explanation

### `app/`

Contains the Next.js App Router entry points.

- `layout.tsx`: root layout and metadata.
- `page.tsx`: main application state, explorer layout, modals, tabs, and editor wiring.
- `globals.css`: global styling, VS Code theme variables, layout, explorer, tabs, modal, and editor styles.

### `components/EditorPanel.tsx`

Renders the right-side editor area, open file tabs, close buttons, and Monaco Editor.

### `components/FileExplorer/`

Contains the file explorer UI.

- `Tree.tsx`: manages visible tree selection, keyboard navigation, rename state, and delete confirmation state.
- `TreeNode.tsx`: recursive file/folder row renderer.
- `ContextMenu.tsx`: VS Code-style right-click menu.
- `FileTree.tsx`: standalone tree wrapper component.

### `components/FileExplorer/types/`

Contains shared TypeScript types for file and folder nodes.

### `components/FileExplorer/utils/`

Contains recursive tree utilities.

- `fileTree.ts`: add, delete, rename, toggle, find, validate names, collect subtree ids, and update file content.
- `filterTree.ts`: case-insensitive tree search that keeps matching parent folders visible.
- `treeNavigation.ts`: flattens visible nodes for keyboard navigation.

### `data/`

Contains optional seed data for the file tree.
