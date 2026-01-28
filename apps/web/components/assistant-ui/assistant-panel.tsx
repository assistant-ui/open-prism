"use client";

import { Thread } from "./thread";
import { useDocumentContext } from "@/hooks/use-document-context";

export function AssistantPanel() {
  useDocumentContext();

  return (
    <div className="flex h-full flex-col border-border border-l bg-background">
      <div className="flex items-center border-border border-b px-4 py-2">
        <h2 className="font-medium text-sm">AI Assistant</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <Thread />
      </div>
    </div>
  );
}
