"use client";

import { useEffect, useState, useCallback } from "react";
import { subscribeToData, replaceAppData, ensureDemoData } from "@/lib/data/store";
import { isLiveMode, pullCloudData } from "@/lib/data/cloudSync";

export function useAppData() {
  const [version, setVersion] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      ensureDemoData();
      if (isLiveMode()) {
        const cloud = await pullCloudData();
        if (!cancelled && cloud && (cloud.users?.length || cloud.requests?.length || cloud.properties?.length)) {
          replaceAppData(cloud);
        } else if (!cancelled && cloud) {
          // Cloud empty: clear sample seed so live starts clean
          const local = ensureDemoData();
          const onlySamples = (local.users || []).length > 0
            && local.users.every((u) => String(u.id).startsWith("usr_"));
          if (onlySamples) replaceAppData(cloud);
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
