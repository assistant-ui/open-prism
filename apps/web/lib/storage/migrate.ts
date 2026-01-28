import type { ProjectFile } from "@/stores/document-store";

const LOCALSTORAGE_KEY = "open-prism-document";
const MIGRATION_FLAG = "open-prism-migrated-to-indexeddb";

interface OldPersistedState {
  state: {
    files: ProjectFile[];
    activeFileId: string;
  };
}

export async function migrateFromLocalStorage(
  _name: string,
): Promise<{ files: ProjectFile[]; activeFileId: string } | null> {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(MIGRATION_FLAG)) return null;

  const oldData = localStorage.getItem(LOCALSTORAGE_KEY);
  if (!oldData) {
    localStorage.setItem(MIGRATION_FLAG, "1");
    return null;
  }

  try {
    const parsed: OldPersistedState = JSON.parse(oldData);
    if (parsed.state?.files && parsed.state?.activeFileId) {
      localStorage.setItem(MIGRATION_FLAG, "1");
      localStorage.removeItem(LOCALSTORAGE_KEY);
      return {
        files: parsed.state.files,
        activeFileId: parsed.state.activeFileId,
      };
    }
  } catch {}

  localStorage.setItem(MIGRATION_FLAG, "1");
  return null;
}
