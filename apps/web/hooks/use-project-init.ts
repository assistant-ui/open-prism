"use client";

import { useEffect } from "react";
import { useDocumentStore } from "@/stores/document-store";

const DEFAULT_IMAGE_FILE = {
  name: "hand-write.jpg",
  path: "/hand-write.jpg",
};

async function loadImageAsDataUrl(path: string): Promise<string> {
  const res = await fetch(path);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useProjectInit() {
  const files = useDocumentStore((s) => s.files);
  const addFile = useDocumentStore((s) => s.addFile);
  const initialized = useDocumentStore((s) => s.initialized);
  const setInitialized = useDocumentStore((s) => s.setInitialized);

  useEffect(() => {
    if (initialized) return;

    const existingImage = files.find(
      (f) => f.type === "image" && f.name === DEFAULT_IMAGE_FILE.name,
    );

    if (existingImage?.dataUrl) {
      setInitialized();
      return;
    }

    const currentActiveId = useDocumentStore.getState().activeFileId;

    loadImageAsDataUrl(DEFAULT_IMAGE_FILE.path)
      .then((dataUrl) => {
        if (existingImage) {
          useDocumentStore.setState((state) => ({
            files: state.files.map((f) =>
              f.id === existingImage.id ? { ...f, dataUrl } : f,
            ),
          }));
        } else {
          addFile({
            name: DEFAULT_IMAGE_FILE.name,
            type: "image",
            dataUrl,
          });
          useDocumentStore.getState().setActiveFile(currentActiveId);
        }
        setInitialized();
      })
      .catch((err) => {
        console.error("Failed to load default image:", err);
        setInitialized();
      });
  }, [files, addFile, initialized, setInitialized]);
}
