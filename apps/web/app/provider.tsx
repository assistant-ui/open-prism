"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { ThemeProvider } from "next-themes";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export function RootProvider({ children }: { children: ReactNode }) {
  const runtime = useChatRuntime({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  useKeyboardShortcuts();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AssistantRuntimeProvider runtime={runtime}>
        {children}
        <Toaster />
      </AssistantRuntimeProvider>
    </ThemeProvider>
  );
}
