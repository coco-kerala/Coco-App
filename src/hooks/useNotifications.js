"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "kerago_notifications_v1";
const PERM_ASKED = "kerago_notif_asked";

function readStore() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeStore(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {}
}

/**
 * In-app notification list + optional browser/PWA permission.
 * True push (when app is closed) needs Firebase / OneSignal later.
 */
export function useNotifications() {
  const [items, setItems] = useState([]);
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    setItems(readStore());
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  const add = useCallback((notif) => {
    const entry = {
      id: `n_${Date.now()}`,
      title: notif.title,
      body: notif.body || "",
      createdAt: new Date().toISOString(),
      read: false,
      href: notif.href || null,
    };
    setItems((prev) => {
      const next = [entry, ...prev];
      writeStore(next);
      return next;
    });

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(entry.title, { body: entry.body, icon: "/icons/icon-192.png" });
      } catch {}
    }
    return entry;
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      writeStore(next);
      return next;
    });
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

  const unread = items.filter((n) => !n.read).length;

  return {
    items,
    unread,
    permission,
    add,
    markAllRead,
    requestPermission,
  };
}
