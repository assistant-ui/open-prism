"use client";

import { useAssistantTool } from "@assistant-ui/react";
import {
  CheckIcon,
  LoaderIcon,
  PlusIcon,
  ReplaceIcon,
  SearchIcon,
} from "lucide-react";
import type { FC } from "react";
import { z } from "zod";

import { useDocumentStore } from "@/stores/document-store";

export const LatexTools: FC = () => {
  const insertAtCursor = useDocumentStore((s) => s.insertAtCursor);
  const replaceSelection = useDocumentStore((s) => s.replaceSelection);
  const findAndReplace = useDocumentStore((s) => s.findAndReplace);
  const selectionRange = useDocumentStore((s) => s.selectionRange);

  useAssistantTool({
    toolName: "insert_latex",
    description:
      "Insert LaTeX code at the current cursor position in the document",
    parameters: z.object({
      code: z
        .string()
        .describe("The LaTeX code to insert at the cursor position"),
    }),
    execute: async ({ code }: { code: string }) => {
      insertAtCursor(code);
      return { success: true, message: "Code inserted at cursor position" };
    },
    render: function InsertLatexRender({ result }) {
      const isComplete = result != null;
      return (
        <div className="my-2 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
          {isComplete ? (
            <CheckIcon className="size-4 text-green-600" />
          ) : (
            <LoaderIcon className="size-4 animate-spin text-muted-foreground" />
          )}
          <PlusIcon className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {isComplete ? "Inserted LaTeX code" : "Inserting LaTeX code..."}
          </span>
        </div>
      );
    },
  });

  useAssistantTool({
    toolName: "replace_selection",
    description:
      "Replace the currently selected text in the document with LaTeX code",
    parameters: z.object({
      code: z.string().describe("The LaTeX code to replace the selection with"),
    }),
    execute: async ({ code }: { code: string }) => {
      if (!selectionRange) {
        return {
          success: false,
          error: "No text is currently selected in the editor",
        };
      }
      replaceSelection(selectionRange.start, selectionRange.end, code);
      return { success: true, message: "Selection replaced with code" };
    },
    render: function ReplaceSelectionRender({ result }) {
      const isComplete = result != null;
      const hasError = result?.success === false;
      return (
        <div className="my-2 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
          {isComplete ? (
            hasError ? (
              <span className="size-4 text-amber-600">!</span>
            ) : (
              <CheckIcon className="size-4 text-green-600" />
            )
          ) : (
            <LoaderIcon className="size-4 animate-spin text-muted-foreground" />
          )}
          <ReplaceIcon className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {hasError
              ? result.error
              : isComplete
                ? "Replaced selection"
                : "Replacing selection..."}
          </span>
        </div>
      );
    },
  });

  useAssistantTool({
    toolName: "find_and_replace",
    description:
      "Find and replace text in the document. Use this to modify existing content.",
    parameters: z.object({
      find: z.string().describe("The exact text to find in the document"),
      replace: z.string().describe("The text to replace it with"),
    }),
    execute: async ({ find, replace }: { find: string; replace: string }) => {
      const success = findAndReplace(find, replace);
      if (!success) {
        return {
          success: false,
          error: `Could not find "${find}" in the document`,
        };
      }
      return { success: true, message: `Replaced "${find}" with "${replace}"` };
    },
    render: function FindAndReplaceRender({ result }) {
      const isComplete = result != null;
      const hasError = result?.success === false;
      return (
        <div className="my-2 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
          {isComplete ? (
            hasError ? (
              <span className="size-4 text-amber-600">!</span>
            ) : (
              <CheckIcon className="size-4 text-green-600" />
            )
          ) : (
            <LoaderIcon className="size-4 animate-spin text-muted-foreground" />
          )}
          <SearchIcon className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {hasError
              ? result.error
              : isComplete
                ? "Text replaced"
                : "Finding and replacing..."}
          </span>
        </div>
      );
    },
  });

  return null;
};
