"use client";

import { useCallback, useMemo, useRef, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { LoaderIcon } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  data: Uint8Array;
  scale: number;
  onError?: (error: string) => void;
  onLoadSuccess?: (numPages: number) => void;
  onScaleChange?: (scale: number) => void;
  onTextClick?: (text: string) => void;
}

export function PdfViewer({
  data,
  scale,
  onError,
  onLoadSuccess,
  onScaleChange,
  onTextClick,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSetInitialScale = useRef(false);
  const [numPages, setNumPages] = useState(0);

  const file = useMemo(() => {
    const pdfData =
      data instanceof Uint8Array ? data : new Uint8Array(Object.values(data));
    hasSetInitialScale.current = false;
    return { data: pdfData.slice() };
  }, [data]);

  const handleLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      onLoadSuccess?.(numPages);
    },
    [onLoadSuccess],
  );

  const handlePageLoadSuccess = useCallback(
    ({ width }: { width: number }) => {
      if (hasSetInitialScale.current) return;
      if (containerRef.current && onScaleChange) {
        hasSetInitialScale.current = true;
        const containerWidth = containerRef.current.clientWidth - 32;
        const fitScale = containerWidth / width;
        onScaleChange(Math.min(fitScale, 2));
      }
    },
    [onScaleChange],
  );

  const handleLoadError = useCallback(
    (error: Error) => {
      onError?.(error.message);
    },
    [onError],
  );

  const handleTextLayerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!onTextClick) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === "SPAN" &&
        target.closest(".react-pdf__Page__textContent")
      ) {
        const text = target.textContent?.trim();
        if (text && text.length > 2) {
          onTextClick(text);
        }
      }
    },
    [onTextClick],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onScaleChange) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        onScaleChange(Math.max(0.25, Math.min(4, scale + delta)));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [scale, onScaleChange]);

  return (
    <div ref={containerRef} className="flex-1 overflow-auto">
      <div
        className="flex flex-col items-center gap-4 p-4"
        onClick={handleTextLayerClick}
      >
        <Document
          file={file}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={
            <div className="flex items-center gap-2 text-muted-foreground">
              <LoaderIcon className="size-4 animate-spin" />
              Loading PDF...
            </div>
          }
        >
          {Array.from({ length: numPages }, (_, i) => (
            <Page
              key={i + 1}
              pageNumber={i + 1}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="mb-4 shadow-lg"
              onLoadSuccess={i === 0 ? handlePageLoadSuccess : undefined}
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
