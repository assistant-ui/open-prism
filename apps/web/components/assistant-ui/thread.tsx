"use client";

import {
  ActionBarPrimitive,
  AuiIf,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  RefreshCwIcon,
  SquareIcon,
} from "lucide-react";
import type { FC } from "react";
import remarkGfm from "remark-gfm";

import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root className="aui-root aui-thread-root flex h-full flex-col bg-background">
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth px-4 pt-4"
      >
        <AuiIf condition={({ thread }) => thread.isEmpty}>
          <ThreadWelcome />
        </AuiIf>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />

        <ThreadPrimitive.ViewportFooter className="aui-thread-viewport-footer sticky bottom-0 mt-auto flex w-full flex-col gap-4 overflow-visible rounded-t-3xl pb-4">
          <ThreadScrollToBottom />
          <Composer />
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible dark:bg-background dark:hover:bg-accent"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <div className="mx-auto my-auto flex w-full grow flex-col items-center justify-center px-4">
      <h1 className="mb-2 font-semibold text-xl">LaTeX Assistant</h1>
      <p className="text-center text-muted-foreground text-sm">
        Ask me anything about LaTeX! I can help you with equations, document
        structure, formatting, and more.
      </p>
    </div>
  );
};

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="relative flex w-full flex-col">
      <div className="flex w-full flex-col rounded-2xl border border-input bg-background px-1 pt-2 outline-none transition-shadow has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-2 has-[textarea:focus-visible]:ring-ring/20">
        <ComposerPrimitive.Input
          placeholder="Ask about LaTeX..."
          className="mb-1 max-h-32 min-h-14 w-full resize-none bg-transparent px-4 pt-2 pb-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <ComposerAction />
      </div>
    </ComposerPrimitive.Root>
  );
};

const ComposerAction: FC = () => {
  return (
    <div className="relative mx-2 mb-2 flex items-center justify-end">
      <AuiIf condition={({ thread }) => !thread.isRunning}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send message"
            side="bottom"
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
          <Button
            type="button"
            variant="default"
            size="icon"
            className="size-8 rounded-full"
            aria-label="Stop generating"
          >
            <SquareIcon className="size-3 fill-current" />
          </Button>
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </div>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="relative w-full py-3"
      data-role="assistant"
    >
      <div className="px-2 text-foreground leading-relaxed">
        <MessagePrimitive.Parts
          components={{
            Text: MarkdownText,
          }}
        />
      </div>

      <div className="mt-1 ml-2 flex">
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};

const MarkdownText: FC = () => {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-md prose prose-sm dark:prose-invert max-w-none"
    />
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="-ml-1 flex gap-1 text-muted-foreground"
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
      className="flex w-full flex-col items-end py-3"
      data-role="user"
    >
      <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-2.5 text-foreground">
        <MessagePrimitive.Parts />
      </div>
      <BranchPicker className="mr-2 justify-end" />
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
