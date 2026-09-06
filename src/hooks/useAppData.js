"use client";

import { useEffect, useState, useCallback } from "react";
import { subscribeToData, replaceAppData, ensureAppData, getAppData } from "@/lib/data/store";
import { isLiveMode, pullCloudData } from "@/lib/data/cloudSync";
import { mergeCloudIntoLocal } from "@/lib/data/mergeCloud";

export function useAppData() {
  const [version, setVersion] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        ensureAppData();
        if (isLiveMode()) {
          const cloud = await pullCloudData();
          if (!cancelled && cloud) {
            const merged = mergeCloudIntoLocal(getAppData(), cloud);
            replaceAppData(merged);
          }
        }
      } catch (e) {
        console.warn("[useAppData]", e);
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
