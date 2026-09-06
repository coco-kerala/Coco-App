"use client";

import { useCallback, useEffect, useState } from "react";

const PERM_ASKED = "kerago_notif_asked";

/** Permission only — no realtime (safe to use next to NotifBell). */
export function useNotificationPermission() {
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "unsupported";
    try {
      localStorage.setItem(PERM_ASKED, "1");
    } catch {}
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  return { permission, requestPermission };
}
