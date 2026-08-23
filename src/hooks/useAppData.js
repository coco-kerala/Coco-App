"use client";

import { useEffect, useState, useCallback } from "react";
import { subscribeToData } from "@/lib/data/store";

export function useAppData() {
  const [version, setVersion] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    return subscribeToData(() => setVersion((v) => v + 1));
  }, []);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return { version, ready, refresh };
}
