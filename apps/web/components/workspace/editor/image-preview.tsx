"use client";

import { ImageIcon } from "lucide-react";
import type { ProjectFile } from "@/stores/document-store";

interface ImagePreviewProps {
  file: ProjectFile;
  scale: number;
}

export function ImagePreview({ file, scale }: ImagePreviewProps) {
  if (!file.dataUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-8">
        <ImageIcon className="mb-4 size-16 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">No image data available</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-muted/50 p-4">
      <div className="flex justify-center">
        <img
          src={file.dataUrl}
          alt={file.name}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
          className="max-w-none transition-transform"
        />
      </div>
    </div>
  );
}
