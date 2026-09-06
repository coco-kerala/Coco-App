"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchCloudNotifications,
  getLocalNotificationsForUser,
  markCloudNotificationsRead,
  markLocalNotificationsRead,
  subscribeNotifLocal,
  subscribeNotifRealtime,
} from "@/lib/notifications/notify";

const PERM_ASKED = "kerago_notif_asked";

/**
 * In-app + browser notifications for the logged-in user.
 * Safe if realtime fails — never crash the page.
 */
export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;
  const [items, setItems] = useState([]);
  const [permission, setPermission] = useState("default");

  const reload = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }
    try {
      const local = getLocalNotificationsForUser(userId);
      const cloud = await fetchCloudNotifications(userId);
      const map = new Map();
      [...cloud, ...local].forEach((n) => map.set(n.id, n));
      const merged = [...map.values()].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setItems(merged);
    } catch (e) {
      console.warn("[kerago] notif reload:", e);
    }
  }, [userId]);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!userId) return undefined;
    reload();
    const unsubLocal = subscribeNotifLocal(() => reload());
    let unsubRt = () => {};
    try {
      unsubRt = subscribeNotifRealtime(userId, () => reload());
    } catch (e) {
      console.warn("[kerago] notif realtime:", e);
    }
    return () => {
      unsubLocal();
      unsubRt();
    };
  }, [userId, reload]);

  const add = useCallback(
    async (notif) => {
      const { notifyUser } = await import("@/lib/notifications/notify");
      if (!userId) return null;
      const entry = await notifyUser({
        userId,
        title: notif.title,
        body: notif.body,
        href: notif.href,
        type: notif.type || "update",
      });
      await reload();
      return entry;
    },
    [userId, reload]
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    markLocalNotificationsRead(userId);
    await markCloudNotificationsRead(userId);
    await reload();
  }, [userId, reload]);

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
    reload,
  };
}
