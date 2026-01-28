"use client";

import { useEffect, useState } from "react";
import {
  waitForStorageReady,
  isStorageReady,
} from "@/lib/storage/indexeddb-storage";

export function useStorageReady(): boolean {
  const [ready, setReady] = useState(isStorageReady);

  useEffect(() => {
    if (ready) return;

    waitForStorageReady().then(() => {
      setReady(true);
    });
  }, [ready]);

  return ready;
}
