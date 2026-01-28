import { openDB, type IDBPDatabase } from "idb";
import type { StateStorage } from "zustand/middleware";
import type { ProjectFile } from "@/stores/document-store";
import {
  type OpenPrismDB,
  DB_NAME,
  DB_VERSION,
  STORAGE_VERSION,
} from "./schema";
import { migrateFromLocalStorage } from "./migrate";

let dbPromise: Promise<IDBPDatabase<OpenPrismDB>> | null = null;

function getDB(): Promise<IDBPDatabase<OpenPrismDB>> {
  if (!dbPromise) {
    dbPromise = openDB<OpenPrismDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("documentState")) {
          db.createObjectStore("documentState");
        }
        if (!db.objectStoreNames.contains("blobs")) {
          db.createObjectStore("blobs", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

interface PersistedState {
  files: ProjectFile[];
  activeFileId: string;
  pdfData?: Uint8Array | null;
}

export const indexedDBStorage: StateStorage = {
  async getItem(name: string): Promise<string | null> {
    const migrated = await migrateFromLocalStorage(name);
    if (migrated) {
      await indexedDBStorage.setItem(name, JSON.stringify({ state: migrated }));
    }

    const db = await getDB();

    const stored = await db.get("documentState", "state");
    if (!stored) return null;

    const files = await Promise.all(
      stored.files.map(async (file) => {
        if (file.type === "image") {
          const blob = await db.get("blobs", file.id);
          if (blob && typeof blob.data === "string") {
            return { ...file, dataUrl: blob.data };
          }
        }
        return file;
      }),
    );

    const pdfBlob = await db.get("blobs", "pdf");
    const pdfData =
      pdfBlob && pdfBlob.data instanceof Uint8Array ? pdfBlob.data : null;

    const state: PersistedState = {
      files,
      activeFileId: stored.activeFileId,
      pdfData,
    };

    return JSON.stringify({ state });
  },

  async setItem(_name: string, value: string): Promise<void> {
    const db = await getDB();
    const parsed = JSON.parse(value);
    const state = parsed.state as PersistedState;

    const filesToStore: ProjectFile[] = [];
    const blobsToStore: {
      id: string;
      data: string | Uint8Array;
      type: "image" | "pdf";
    }[] = [];

    for (const file of state.files) {
      if (file.type === "image" && file.dataUrl) {
        blobsToStore.push({
          id: file.id,
          data: file.dataUrl,
          type: "image",
        });
        filesToStore.push({ ...file, dataUrl: undefined });
      } else {
        filesToStore.push(file);
      }
    }

    if (state.pdfData) {
      blobsToStore.push({
        id: "pdf",
        data: state.pdfData,
        type: "pdf",
      });
    }

    const existingBlobs = await db.getAllKeys("blobs");
    const newBlobIds = new Set(blobsToStore.map((b) => b.id));
    const orphanIds = existingBlobs.filter(
      (id) => id !== "pdf" && !newBlobIds.has(id),
    );

    const tx = db.transaction(["documentState", "blobs"], "readwrite");

    await tx.objectStore("documentState").put(
      {
        files: filesToStore,
        activeFileId: state.activeFileId,
        version: STORAGE_VERSION,
      },
      "state",
    );

    const blobStore = tx.objectStore("blobs");
    for (const blob of blobsToStore) {
      await blobStore.put(blob);
    }

    for (const id of orphanIds) {
      await blobStore.delete(id);
    }

    if (!state.pdfData) {
      await blobStore.delete("pdf");
    }

    await tx.done;
  },

  async removeItem(_name: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(["documentState", "blobs"], "readwrite");
    await tx.objectStore("documentState").clear();
    await tx.objectStore("blobs").clear();
    await tx.done;
  },
};

let storageReady = false;
let storageReadyPromise: Promise<void> | null = null;

export function waitForStorageReady(): Promise<void> {
  if (storageReady) return Promise.resolve();

  if (!storageReadyPromise) {
    storageReadyPromise = (async () => {
      await getDB();
      storageReady = true;
    })();
  }

  return storageReadyPromise;
}

export function isStorageReady(): boolean {
  return storageReady;
}
