import type { DBSchema } from "idb";
import type { ProjectFile } from "@/stores/document-store";

export interface OpenPrismDB extends DBSchema {
  documentState: {
    key: "state";
    value: {
      files: ProjectFile[];
      activeFileId: string;
      version: number;
    };
  };
  blobs: {
    key: string;
    value: {
      id: string;
      data: string | Uint8Array;
      type: "image" | "pdf";
    };
  };
}

export const DB_NAME = "open-prism";
export const DB_VERSION = 1;
export const STORAGE_VERSION = 1;
