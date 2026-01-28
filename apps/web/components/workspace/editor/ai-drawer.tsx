"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  ActionBarPrimitive,
  AuiIf,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useThreadRuntime,
} from "@assistant-ui/react";
import {
  MarkdownTextPrimitive,
  type SyntaxHighlighterProps,
} from "@assistant-ui/react-markdown";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  LoaderIcon,
  MessageCircleIcon,
  PlusIcon,
  RefreshCwIcon,
  SquareIcon,
} from "lucide-react";
import type { FC } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/stores/document-store";
import { useDocumentContext } from "@/hooks/use-document-context";

const MIN_HEIGHT = 150;
const DEFAULT_HEIGHT = 180;

export function AIDrawer() {
  useDocumentContext();
  const threadRuntime = useThreadRuntime();

  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasDraggedRef = useRef(false);
  const heightRef = useRef(height);
  heightRef.current = height;

  useEffect(() => {
    return threadRuntime.subscribe(() => {
      const state = threadRuntime.getState();
      if (state.isRunning) {
        setIsOpen(true);
        const parent = containerRef.current?.parentElement;
        const maxHeight = parent ? parent.clientHeight * 0.5 : 400;
        setHeight(maxHeight);
        heightRef.current = maxHeight;
        if (panelRef.current) {
          panelRef.current.style.height = `${maxHeight}px`;
        }
      }
    });
  }, [threadRuntime]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    hasDraggedRef.current = false;

    const startY = e.clientY;
    const startHeight = heightRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      hasDraggedRef.current = true;
      const parent = containerRef.current?.parentElement;
      const maxHeight = parent ? parent.clientHeight * 0.5 : 400;
      const delta = startY - e.clientY;
      const newHeight = Math.min(
        Math.max(startHeight + delta, MIN_HEIGHT),
        maxHeight,
      );
      heightRef.current = newHeight;
      if (panelRef.current) {
        panelRef.current.style.height = `${newHeight}px`;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setHeight(heightRef.current);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 pb-6"
    >
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "pointer-events-auto absolute right-4 bottom-6 flex size-12 items-center justify-center rounded-full border border-border bg-background shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl",
          isOpen
            ? "pointer-events-none scale-50 opacity-0"
            : "scale-100 opacity-100",
        )}
        aria-label="Open AI Assistant"
      >
        <MessageCircleIcon className="size-5 text-foreground" />
      </button>

      <ThreadPrimitive.Root
        ref={panelRef}
        className={cn(
          "aui-root pointer-events-auto flex w-full max-w-2xl origin-bottom flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl transition-all duration-300 ease-out",
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
          isDragging && "!transition-none",
        )}
        style={{ height: isOpen ? height : 0 }}
        data-dragging={isDragging}
      >
        <div
          className="group flex cursor-row-resize items-center justify-center gap-2 py-2 transition-colors hover:bg-muted/50"
          onMouseDown={handleMouseDown}
          onClick={() => {
            if (!hasDraggedRef.current) {
              setIsOpen(false);
            }
          }}
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30 transition-all group-hover:w-8" />
          <ChevronDownIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <ThreadMessages />
        <Composer />
      </ThreadPrimitive.Root>
    </div>
  );
}

const ThreadMessages: FC = () => {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <ThreadPrimitive.Viewport
        turnAnchor="bottom"
        className="aui-thread-viewport absolute inset-0 overflow-y-auto scroll-smooth px-4"
      >
        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
        <ThreadLoading />
      </ThreadPrimitive.Viewport>

      <ThreadScrollToBottom />
    </div>
  );
};

const ThreadLoading: FC = () => {
  return (
    <AuiIf condition={({ thread }) => thread.isRunning}>
      <div className="flex items-center gap-1.5 px-1 py-1.5 text-muted-foreground">
        <LoaderIcon className="size-3.5 animate-spin" />
        <span className="text-sm">Thinking...</span>
      </div>
    </AuiIf>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute right-4 bottom-2 z-10 rounded-full p-2 disabled:invisible dark:bg-background dark:hover:bg-accent"
      >
        <ArrowDownIcon className="size-4" />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="shrink-0 p-3">
      <div className="flex w-full flex-col rounded-2xl border border-input bg-muted/30 transition-colors focus-within:border-ring focus-within:bg-background">
        <ComposerPrimitive.Input
          placeholder="Ask about LaTeX..."
          className="max-h-40 min-h-10 w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          autoFocus
          aria-label="Message input"
        />
        <div className="flex items-center justify-end px-2 pb-2">
          <ComposerAction />
        </div>
      </div>
    </ComposerPrimitive.Root>
  );
};

const ComposerAction: FC = () => {
  return (
    <>
      <AuiIf condition={({ thread }) => !thread.isRunning}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send"
            side="top"
            type="submit"
            variant="default"
            size="icon"
            className="size-8 rounded-full"
            aria-label="Send message"
          >
            <ArrowUpIcon className="size-4" />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </AuiIf>
      <AuiIf condition={({ thread }) => thread.isRunning}>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip="Stop"
            side="top"
            variant="secondary"
            size="icon"
            className="size-8 rounded-full"
            aria-label="Stop generating"
          >
            <SquareIcon className="size-3 fill-current" />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="group relative w-full py-1.5"
      data-role="assistant"
    >
      <div className="px-1 text-foreground text-sm leading-relaxed">
        <MessagePrimitive.Parts
          components={{
            Text: MarkdownText,
          }}
        />
      </div>

      <div className="ml-1 flex">
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};

const CodeBlock: FC<SyntaxHighlighterProps> = ({ language, code }) => {
  const insertAtCursor = useDocumentStore((s) => s.insertAtCursor);
  const isLatex = language === "latex" || language === "tex";

  const handleInsert = useCallback(() => {
    insertAtCursor(code);
  }, [insertAtCursor, code]);

  return (
    <div className="group relative my-1">
      <pre className="overflow-x-auto rounded bg-muted p-2 text-sm">
        <code>{code}</code>
      </pre>
      {isLatex && (
        <button
          type="button"
          onClick={handleInsert}
          className="absolute top-1 right-1 flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-primary-foreground text-xs opacity-0 transition-opacity group-hover:opacity-100"
        >
          <PlusIcon className="size-3" />
          Insert
        </button>
      )}
    </div>
  );
};

const MarkdownText: FC = () => {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        SyntaxHighlighter: CodeBlock,
      }}
      className="aui-md prose prose-sm dark:prose-invert max-w-none"
    />
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      className="-ml-1 flex gap-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <AuiIf condition={({ message }) => message.isCopied}>
            <CheckIcon />
          </AuiIf>
          <AuiIf condition={({ message }) => !message.isCopied}>
            <CopyIcon />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Regenerate">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="flex w-full flex-col items-end py-1.5"
      data-role="user"
    >
      <div className="max-w-[85%] rounded-xl bg-muted px-3 py-1.5 text-foreground text-sm">
        <MessagePrimitive.Parts />
      </div>
      <BranchPicker className="mr-1 justify-end" />
    </MessagePrimitive.Root>
  );
};

const BranchPicker: FC<{ className?: string }> = ({ className }) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "mr-2 -ml-2 inline-flex items-center text-muted-foreground text-xs",
        className,
      )}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
