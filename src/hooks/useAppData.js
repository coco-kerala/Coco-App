"use client";

import { useEffect, useState, useCallback } from "react";
import { subscribeToData, replaceAppData, ensureAppData } from "@/lib/data/store";
import { isLiveMode, pullCloudData } from "@/lib/data/cloudSync";

export function useAppData() {
  const [version, setVersion] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      ensureAppData();
      if (isLiveMode()) {
        const cloud = await pullCloudData();
        if (!cancelled && cloud) {
          replaceAppData(cloud);
        }
      }
      if (!cancelled) setReady(true);
    })();

    const unsub = subscribeToData(() => setVersion((v) => v + 1));
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return { version, ready, refresh };
}
