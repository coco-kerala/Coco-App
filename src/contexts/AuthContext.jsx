"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import {
  ensureAppData,
  getUserById,
  updateUserProfile,
  getAppData,
  replaceAppData,
} from "@/lib/data/store";
import {
  requestOtpBackend,
  verifyOtpBackend,
  supabaseOtpReady,
} from "@/lib/otp/supabaseBackend";
import { generateId } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isLiveMode } from "@/lib/data/cloudSync";

/** Legacy single-session keys (migrated once). */
const AUTH_KEY = "coco_auth_user_id";
const AUTH_SESSION = "coco_auth_verified";
const AUTH_USER_JSON = "coco_auth_user_json";
/** Per-role sessions so /admin does not wipe /user or /partner login. */
const SESSIONS_KEY = "coco_auth_sessions_v2";

const AuthContext = createContext(null);

function readSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {}
  return {};
}

function writeSessions(sessions) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {}
}

function migrateLegacySession() {
  try {
    const sessions = readSessions();
    const id = localStorage.getItem(AUTH_KEY);
    const ok = localStorage.getItem(AUTH_SESSION) === "1";
    const raw = localStorage.getItem(AUTH_USER_JSON);
    if (!id || !ok) return sessions;

    const fromJson = raw ? JSON.parse(raw) : null;
    const found = fromJson || getUserById(id);
    if (found?.role && !sessions[found.role]) {
      sessions[found.role] = { user: found, verified: true };
      writeSessions(sessions);
    }
    return sessions;
  } catch {
    return readSessions();
  }
}

function ensureOfficeUserSync() {
  try {
    const data = getAppData();
    const existing = data.users.find(
      (u) => u.role === "admin" && u.id && !String(u.id).startsWith("usr_")
    );
    if (existing) return existing;

    data.users = (data.users || []).filter(
      (u) => !(u.role === "admin" && String(u.id).startsWith("usr_"))
    );
    replaceAppData(data);
  } catch {}

  const admin = {
    id: generateId(),
    name: "Office",
    phone: "office",
    email: "office@kerago.in",
    role: "admin",
    profile_image: null,
    created_at: new Date().toISOString(),
  };

  try {
    const next = getAppData();
    next.users = (next.users || []).filter((u) => u.role !== "admin");
    next.users.push(admin);
    replaceAppData(next);
  } catch {}

  return admin;
}

function syncOfficeUserToCloud(admin) {
  if (!isLiveMode() || !admin?.id) return;
  const sb = getSupabaseClient();
  if (!sb) return;
  sb.from("app_users")
    .upsert(
      {
        id: admin.id,
        name: admin.name,
        phone: "office",
        phone_display: "Office",
        email: admin.email,
        role: "admin",
      },
      { onConflict: "id" }
    )
    .then(({ error }) => {
      if (error) console.warn("[office] upsert:", error.message);
    })
    .catch(() => {});
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [activeRole, setActiveRole] = useState(null);

  useEffect(() => {
    ensureAppData();
    try {
      migrateLegacySession();
    } catch {}
    setLoading(false);
  }, []);

  const persistRole = useCallback((role, u, isVerified) => {
    const sessions = readSessions();
    if (u && isVerified) {
      sessions[role] = { user: u, verified: true };
    } else {
      delete sessions[role];
    }
    writeSessions(sessions);

    try {
      if (u && isVerified) {
        localStorage.setItem(AUTH_KEY, u.id);
        localStorage.setItem(AUTH_USER_JSON, JSON.stringify(u));
        localStorage.setItem(AUTH_SESSION, "1");
      } else {
        const remaining = Object.values(sessions).find((s) => s?.verified && s?.user);
        if (remaining?.user) {
          localStorage.setItem(AUTH_KEY, remaining.user.id);
          localStorage.setItem(AUTH_USER_JSON, JSON.stringify(remaining.user));
          localStorage.setItem(AUTH_SESSION, "1");
        } else {
          localStorage.removeItem(AUTH_KEY);
          localStorage.removeItem(AUTH_USER_JSON);
          localStorage.removeItem(AUTH_SESSION);
        }
      }
    } catch {}

    setActiveRole(u && isVerified ? role : null);
    setUser(u && isVerified ? u : null);
    setVerified(!!(u && isVerified));
  }, []);

  /** Load this role's saved session into the live auth state (does not wipe other roles). */
  const switchToRole = useCallback((role) => {
    const sessions = migrateLegacySession();
    const slot = sessions[role];
    setActiveRole(role);
    if (slot?.verified && slot?.user) {
      setUser(slot.user);
      setVerified(true);
      try {
        localStorage.setItem(AUTH_KEY, slot.user.id);
        localStorage.setItem(AUTH_USER_JSON, JSON.stringify(slot.user));
        localStorage.setItem(AUTH_SESSION, "1");
      } catch {}
      return slot.user;
    }
    setUser(null);
    setVerified(false);
    return null;
  }, []);

  const getSessionForRole = useCallback((role) => {
    const sessions = readSessions();
    const slot = sessions[role];
    if (slot?.verified && slot?.user) return slot.user;
    return null;
  }, []);

  const requestOtp = useCallback(async (phone, role) => {
    if (role === "admin") {
      throw new Error("Office does not use WhatsApp OTP");
    }
    const session = await requestOtpBackend({ phone, role });
    return {
      ok: true,
      phone: session.phone_display,
      revealOtp: null,
      expiresAt: session.expires_at,
      source: supabaseOtpReady() ? "supabase" : "local",
    };
  }, []);

  const verifyOtp = useCallback(async (phone, role, code) => {
    if (role === "admin") {
      return { ok: false, error: "Office does not use WhatsApp OTP" };
    }
    const result = await verifyOtpBackend({ phone, role, code });
    if (!result.ok) return result;
    persistRole(role, result.user, true);
    return { ok: true, user: result.user };
  }, [persistRole]);

  const loginOffice = useCallback(async () => {
    const admin = ensureOfficeUserSync();
    persistRole("admin", admin, true);
    syncOfficeUserToCloud(admin);
    return { ok: true, user: admin };
  }, [persistRole]);

  const refreshUser = useCallback(() => {
    if (!user?.id || !activeRole) return;
    const fresh = getUserById(user.id) || user;
    persistRole(activeRole, fresh, true);
  }, [user, activeRole, persistRole]);

  const updateProfile = useCallback((updates) => {
    if (!user?.id || !activeRole) return null;
    try {
      const updated = updateUserProfile(user.id, updates);
      persistRole(activeRole, { ...updated }, true);
      return updated;
    } catch {
      const merged = { ...user, ...updates };
      persistRole(activeRole, merged, true);
      return merged;
    }
  }, [user, activeRole, persistRole]);

  const logout = useCallback(() => {
    const role = activeRole || user?.role;
    if (role) {
      const sessions = readSessions();
      delete sessions[role];
      writeSessions(sessions);
    }
    setUser(null);
    setVerified(false);
    setActiveRole(null);
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_USER_JSON);
      localStorage.removeItem(AUTH_SESSION);
    } catch {}
  }, [activeRole, user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      verified,
      activeRole,
      isAuthenticated: !!(user && verified),
      supabaseReady: supabaseOtpReady(),
      requestOtp,
      verifyOtp,
      loginOffice,
      switchToRole,
      getSessionForRole,
      refreshUser,
      updateProfile,
      logout,
    }),
    [
      user,
      loading,
      verified,
      activeRole,
      requestOtp,
      verifyOtp,
      loginOffice,
      switchToRole,
      getSessionForRole,
      refreshUser,
      updateProfile,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
