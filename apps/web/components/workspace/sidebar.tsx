"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  PlusIcon,
  MoreHorizontalIcon,
  Trash2Icon,
  PencilIcon,
  UploadIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  ListIcon,
  HashIcon,
  GithubIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useDocumentStore, type ProjectFile } from "@/stores/document-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TocItem {
  level: number;
  title: string;
  line: number;
}

function parseTableOfContents(content: string): TocItem[] {
  const lines = content.split("\n");
  const toc: TocItem[] = [];

  const sectionRegex =
    /\\(section|subsection|subsubsection|chapter|part)\*?\s*\{([^}]*)\}/;

  const levelMap: Record<string, number> = {
    part: 0,
    chapter: 1,
    section: 2,
    subsection: 3,
    subsubsection: 4,
  };

  lines.forEach((line, index) => {
    const match = line.match(sectionRegex);
    if (match) {
      const [, type, title] = match;
      toc.push({
        level: levelMap[type] ?? 2,
        title: title.trim(),
        line: index + 1,
      });
    }
  });

  return toc;
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import packageJson from "@/package.json";

export function Sidebar() {
  const files = useDocumentStore((s) => s.files);
  const activeFileId = useDocumentStore((s) => s.activeFileId);
  const setActiveFile = useDocumentStore((s) => s.setActiveFile);
  const addFile = useDocumentStore((s) => s.addFile);
  const deleteFile = useDocumentStore((s) => s.deleteFile);
  const renameFile = useDocumentStore((s) => s.renameFile);
  const content = useDocumentStore((s) => s.content);
  const requestJumpToPosition = useDocumentStore(
    (s) => s.requestJumpToPosition,
  );
  const { theme, setTheme } = useTheme();

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const toc = useMemo(() => parseTableOfContents(content), [content]);

  const handleTocClick = useCallback(
    (line: number) => {
      const lines = content.split("\n");
      let position = 0;
      for (let i = 0; i < line - 1 && i < lines.length; i++) {
        position += lines[i].length + 1;
      }
      requestJumpToPosition(position);
    },
    [content, requestJumpToPosition],
  );
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameFileId, setRenameFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTexFile = () => {
    const name = newFileName.trim() || "untitled.tex";
    const finalName = name.endsWith(".tex") ? name : `${name}.tex`;
    addFile({
      name: finalName,
      type: "tex",
      content: `\\documentclass{article}\n\n\\begin{document}\n\n% Your content here\n\n\\end{document}\n`,
    });
    setNewFileName("");
    setAddDialogOpen(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = useCallback(
    (uploadedFiles: FileList | null) => {
      if (!uploadedFiles) return;

      Array.from(uploadedFiles).forEach((file) => {
        const reader = new FileReader();

        if (file.type.startsWith("image/")) {
          reader.onload = () => {
            addFile({
              name: file.name,
              type: "image",
              dataUrl: reader.result as string,
            });
          };
          reader.readAsDataURL(file);
        } else if (file.name.endsWith(".tex")) {
          reader.onload = () => {
            addFile({
              name: file.name,
              type: "tex",
              content: reader.result as string,
            });
          };
          reader.readAsText(file);
        }
      });
    },
    [addFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const openRenameDialog = (file: ProjectFile) => {
    setRenameFileId(file.id);
    setRenameValue(file.name);
    setRenameDialogOpen(true);
  };

  const handleRename = () => {
    if (renameFileId && renameValue.trim()) {
      renameFile(renameFileId, renameValue.trim());
    }
    setRenameDialogOpen(false);
    setRenameFileId(null);
    setRenameValue("");
  };

  const getFileIcon = (file: ProjectFile) => {
    if (file.type === "image") {
      return <ImageIcon className="size-4" />;
    }
    return <FileTextIcon className="size-4" />;
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground",
        isDragging && "ring-2 ring-primary ring-inset",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex h-12 items-center border-sidebar-border border-b px-3">
        <div className="flex flex-col">
          <span className="font-semibold text-sm">OpenPrism</span>
          <span className="text-muted-foreground text-xs">
            By{" "}
            <a
              href="https://www.assistant-ui.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              assistant-ui
            </a>
          </span>
        </div>
      </div>

      <div className="flex h-9 items-center justify-between border-sidebar-border border-b px-3">
        <div className="flex items-center gap-2">
          <FolderIcon className="size-4 text-muted-foreground" />
          <span className="font-medium text-xs">Files</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-6" title="Add">
              <PlusIcon className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setAddDialogOpen(true)}>
              <FileTextIcon className="mr-2 size-4" />
              New LaTeX File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUploadClick}>
              <UploadIcon className="mr-2 size-4" />
              Upload File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".tex,image/*"
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {isDragging && (
          <div className="mb-2 flex items-center justify-center rounded-md border-2 border-primary border-dashed p-4">
            <span className="text-muted-foreground text-xs">
              Drop files here
            </span>
          </div>
        )}
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
              file.id === activeFileId
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50",
            )}
          >
            <button
              className="flex flex-1 items-center gap-2 overflow-hidden"
              onClick={() => setActiveFile(file.id)}
            >
              {getFileIcon(file)}
              <span className="truncate">{file.name}</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontalIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openRenameDialog(file)}>
                  <PencilIcon className="mr-2 size-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => deleteFile(file.id)}
                  disabled={files.length <= 1}
                >
                  <Trash2Icon className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <div className="flex h-9 items-center gap-2 border-sidebar-border border-t px-3">
        <ListIcon className="size-4 text-muted-foreground" />
        <span className="font-medium text-xs">Outline</span>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {toc.length > 0 ? (
          toc.map((item, index) => (
            <button
              key={index}
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-sidebar-accent/50"
              style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
              onClick={() => handleTocClick(item.line)}
            >
              <HashIcon className="size-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{item.title}</span>
            </button>
          ))
        ) : (
          <div className="px-2 py-1 text-muted-foreground text-xs">
            No sections found
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-sidebar-border border-t px-3 py-2 text-muted-foreground text-xs">
        <span>OpenPrism v{packageJson.version}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-6" asChild>
            <a
              href="https://github.com/assistant-ui/open-prism"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <GithubIcon className="size-3.5" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => {
              if (theme === "system") setTheme("light");
              else if (theme === "light") setTheme("dark");
              else setTheme("system");
            }}
            title={
              theme === "system"
                ? "System theme"
                : theme === "light"
                  ? "Light mode"
                  : "Dark mode"
            }
          >
            {theme === "system" ? (
              <MonitorIcon className="size-3.5" />
            ) : theme === "light" ? (
              <SunIcon className="size-3.5" />
            ) : (
              <MoonIcon className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Add File Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New LaTeX File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="filename.tex"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTexFile();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTexFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
