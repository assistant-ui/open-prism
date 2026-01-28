"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { ThemeProvider } from "next-themes";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import type { ReactNode } from "react";

export function RootProvider({ children }: { children: ReactNode }) {
  const runtime = useChatRuntime({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AssistantRuntimeProvider runtime={runtime}>
        {children}
      </AssistantRuntimeProvider>
    </ThemeProvider>
  );
}
