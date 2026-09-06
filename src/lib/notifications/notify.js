"use client";

import { generateId } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isLiveMode } from "@/lib/data/cloudSync";

const LOCAL_KEY = "kerago_notifications_v1";
const EVENT = "kerago-notif-change";

/** One live channel per userId — shared by every hook that listens. */
const realtimeByUser = new Map();

function isDemoUserId(userId) {
  return !userId || String(userId).startsWith("usr_");
}

function readLocal() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(items) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items.slice(0, 80)));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {}
}

function showBrowser(title, body) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body: body || "", icon: "/icons/icon-192.png" });
  } catch {}
}

/** Persist + show one notification for a user (local + Supabase). */
export async function notifyUser({ userId, title, body = "", href = null, type = "update" }) {
  if (!userId || !title || isDemoUserId(userId)) return null;

  const entry = {
    id: generateId("n"),
    user_id: userId,
    title,
    body,
    href,
    type,
    read: false,
    created_at: new Date().toISOString(),
  };

  const local = readLocal();
  local.unshift({
    id: entry.id,
    userId,
    title: entry.title,
    body: entry.body,
    href: entry.href,
    createdAt: entry.created_at,
    read: false,
  });
  writeLocal(local);

  try {
    const me = localStorage.getItem("coco_auth_user_id");
    if (me && me === userId) showBrowser(title, body);
  } catch {}

  if (isLiveMode()) {
    const sb = getSupabaseClient();
    if (sb) {
      const { error } = await sb.from("notifications").upsert({
        id: entry.id,
        user_id: entry.user_id,
        title: entry.title,
        body: entry.body,
        href: entry.href,
        type: entry.type,
        read: false,
        created_at: entry.created_at,
      });
      if (error) console.warn("[kerago] notify cloud:", error.message);
    }
  }

  return entry;
}

/** Notify every admin (office). */
export async function notifyAdmins({ title, body, href, type }, users) {
  const admins = (users || []).filter(
    (u) => u.role === "admin" && !isDemoUserId(u.id)
  );
  await Promise.all(
    admins.map((a) => notifyUser({ userId: a.id, title, body, href, type }))
  );
}

export function getLocalNotificationsForUser(userId) {
  return readLocal().filter((n) => !n.userId || n.userId === userId);
}

export function markLocalNotificationsRead(userId) {
  const next = readLocal().map((n) =>
    !n.userId || n.userId === userId ? { ...n, read: true } : n
  );
  writeLocal(next);
  return next.filter((n) => !n.userId || n.userId === userId);
}

export async function fetchCloudNotifications(userId) {
  if (!userId || isDemoUserId(userId) || !isLiveMode()) return [];
  const sb = getSupabaseClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.warn("[kerago] fetch notifs:", error.message);
    return [];
  }
  return (data || []).map((n) => ({
    id: n.id,
    userId: n.user_id,
    title: n.title,
    body: n.body || "",
    href: n.href,
    createdAt: n.created_at,
    read: !!n.read,
  }));
}

export async function markCloudNotificationsRead(userId) {
  if (!userId || isDemoUserId(userId) || !isLiveMode()) return;
  const sb = getSupabaseClient();
  if (!sb) return;
  await sb.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

export function subscribeNotifLocal(cb) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

function handleRealtimeRow(payload, onRow) {
  try {
    const n = payload.new;
    if (!n) return;
    const entry = {
      id: n.id,
      userId: n.user_id,
      title: n.title,
      body: n.body || "",
      href: n.href,
      createdAt: n.created_at,
      read: !!n.read,
    };
    const local = readLocal();
    if (!local.some((x) => x.id === entry.id)) {
      local.unshift(entry);
      writeLocal(local);
    }
    showBrowser(entry.title, entry.body);
    onRow?.(entry);
  } catch (e) {
    console.warn("[kerago] notif callback:", e);
  }
}

/**
 * Realtime for this user. Shared singleton per userId so Strict Mode /
 * NotifBell never call .on() after subscribe() on the same channel.
 */
export function subscribeNotifRealtime(userId, onRow) {
  if (!userId || isDemoUserId(userId) || !isLiveMode()) return () => {};
  const sb = getSupabaseClient();
  if (!sb) return () => {};

  let entry = realtimeByUser.get(userId);
  if (!entry) {
    const name = `notif_${String(userId).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 36)}_${Date.now()}`;
    const listeners = new Set();
    let channel = null;

    try {
      channel = sb
        .channel(name)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const current = realtimeByUser.get(userId);
            if (!current) return;
            current.listeners.forEach((fn) => {
              try {
                handleRealtimeRow(payload, fn);
              } catch {}
            });
          }
        )
        .subscribe((status, err) => {
          if (err) console.warn("[kerago] notif subscribe:", err.message || err);
          if (status === "CHANNEL_ERROR") console.warn("[kerago] notif channel error");
        });
    } catch (e) {
      console.warn("[kerago] notif realtime skipped:", e?.message || e);
      return () => {};
    }

    entry = { channel, listeners, sb };
    realtimeByUser.set(userId, entry);
  }

  if (typeof onRow === "function") entry.listeners.add(onRow);

  return () => {
    const current = realtimeByUser.get(userId);
    if (!current) return;
    if (typeof onRow === "function") current.listeners.delete(onRow);
    if (current.listeners.size > 0) return;
    realtimeByUser.delete(userId);
    try {
      if (current.channel) current.sb.removeChannel(current.channel);
    } catch {}
  };
}
