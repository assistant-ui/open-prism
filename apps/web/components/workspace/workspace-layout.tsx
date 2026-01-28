"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Sidebar } from "./sidebar";
import { LatexEditor } from "./editor/latex-editor";
import { PdfPreview } from "./preview/pdf-preview";
import { useProjectInit } from "@/hooks/use-project-init";
import { useStorageReady } from "@/hooks/use-storage-ready";

export function WorkspaceLayout() {
  const storageReady = useStorageReady();
  useProjectInit();

  if (!storageReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <PanelGroup direction="horizontal" className="h-full">
      <Panel defaultSize={15} minSize={10} maxSize={25}>
        <Sidebar />
      </Panel>

      <PanelResizeHandle className="w-px bg-border transition-colors hover:bg-ring" />

      <Panel defaultSize={42.5} minSize={25}>
        <LatexEditor />
      </Panel>

      <PanelResizeHandle className="w-px bg-border transition-colors hover:bg-ring" />

      <Panel defaultSize={42.5} minSize={25}>
        <PdfPreview />
      </Panel>
    </PanelGroup>
  );
}
