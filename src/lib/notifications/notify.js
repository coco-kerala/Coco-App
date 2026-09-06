"use client";

import { generateId } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isLiveMode } from "@/lib/data/cloudSync";

const LOCAL_KEY = "kerago_notifications_v1";
const EVENT = "kerago-notif-change";

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
  if (!userId || !title) return null;

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

  // Local mirror for current device (also used when cloud offline)
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

  // Browser toast if this device is the recipient
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
  const admins = (users || []).filter((u) => u.role === "admin");
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
  if (!userId || !isLiveMode()) return [];
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
  if (!userId || !isLiveMode()) return;
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

/** Realtime: new notifications for this user → merge + browser ping */
export function subscribeNotifRealtime(userId, onRow) {
  if (!userId || !isLiveMode()) return () => {};
  const sb = getSupabaseClient();
  if (!sb) return () => {};

  const channel = sb
    .channel(`notif:${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
      (payload) => {
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
      }
    )
    .subscribe();

  return () => {
    sb.removeChannel(channel);
  };
}
