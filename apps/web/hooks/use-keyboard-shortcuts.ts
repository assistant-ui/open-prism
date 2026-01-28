"use client";

import { useEffect } from "react";
import { useDocumentStore } from "@/stores/document-store";

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        const { setIsSaving } = useDocumentStore.getState();
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
