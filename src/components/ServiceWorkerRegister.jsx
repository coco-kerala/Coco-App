"use client";

import { useEffect } from "react";

const SW_URL = "/sw.js?v=4";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          regs.map(async (reg) => {
            const script = reg.active?.scriptURL || reg.waiting?.scriptURL || "";
            if (!script.includes("v=4")) {
              await reg.unregister();
            }
          })
        );
        await navigator.serviceWorker.register(SW_URL, { scope: "/" });
      } catch {}
    })();
  }, []);

  return null;
}
