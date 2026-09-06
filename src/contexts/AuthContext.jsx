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

const AUTH_KEY = "coco_auth_user_id";
const AUTH_SESSION = "coco_auth_verified";
const AUTH_USER_JSON = "coco_auth_user_json";
const AuthContext = createContext(null);

async function ensureOfficeUser() {
  const data = getAppData();
  let admin = data.users.find((u) => u.role === "admin");
  if (admin) return admin;

  if (isLiveMode()) {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        const { data: rows } = await sb.from("app_users").select("*").eq("role", "admin").limit(1);
        if (rows?.[0]) {
          admin = {
            id: rows[0].id,
            name: rows[0].name || "Office",
            phone: rows[0].phone_display || rows[0].phone || "office",
            email: rows[0].email || "office@kerago.in",
            role: "admin",
            profile_image: rows[0].profile_image || null,
            created_at: rows[0].created_at,
          };
          const next = getAppData();
          if (!next.users.some((u) => u.id === admin.id)) {
            next.users.push(admin);
            replaceAppData(next);
          }
          return admin;
        }
      } catch (e) {
        console.warn("[office] cloud lookup failed", e);
      }
    }
  }

  admin = {
    id: generateId(),
    name: "Office",
    phone: "office",
    email: "office@kerago.in",
    role: "admin",
    profile_image: null,
    created_at: new Date().toISOString(),
  };
  const next = getAppData();
  next.users.push(admin);
  replaceAppData(next);

  if (isLiveMode()) {
    const sb = getSupabaseClient();
    if (sb) {
      const { error } = await sb.from("app_users").upsert(
        {
          id: admin.id,
          name: admin.name,
          phone: "office",
          phone_display: "Office",
          email: admin.email,
          role: "admin",
        },
        { onConflict: "id" }
      );
      if (error) console.warn("[office] upsert:", error.message);
    }
  }
  return admin;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    ensureAppData();
    try {
      const id = localStorage.getItem(AUTH_KEY);
      const ok = localStorage.getItem(AUTH_SESSION) === "1";
      if (id && ok) {
        const raw = localStorage.getItem(AUTH_USER_JSON);
        const fromJson = raw ? JSON.parse(raw) : null;
        const found = fromJson || getUserById(id);
        if (found) {
          setUser(found);
          setVerified(true);
        }
      }
    } catch {}
    setLoading(false);
  }, []);

  const persist = useCallback((u, isVerified) => {
    try {
      if (u) {
        localStorage.setItem(AUTH_KEY, u.id);
        localStorage.setItem(AUTH_USER_JSON, JSON.stringify(u));
      } else {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(AUTH_USER_JSON);
      }
      if (isVerified) localStorage.setItem(AUTH_SESSION, "1");
      else localStorage.removeItem(AUTH_SESSION);
    } catch {}
    setUser(u);
    setVerified(!!isVerified);
  }, []);

  /** WhatsApp OTP — users & partners only */
  const requestOtp = useCallback(async (phone, role) => {
    if (role === "admin") {
      throw new Error("Office uses password login, not WhatsApp OTP");
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
      return { ok: false, error: "Office uses password login" };
    }
    const result = await verifyOtpBackend({ phone, role, code });
    if (!result.ok) return result;
    persist(result.user, true);
    return { ok: true, user: result.user };
  }, [persist]);

  /** Office entry — no password / OTP; anyone with the link can open */
  const loginOffice = useCallback(async () => {
    const admin = await ensureOfficeUser();
    persist(admin, true);
    return { ok: true, user: admin };
  }, [persist]);

  const refreshUser = useCallback(() => {
    if (!user?.id) return;
    const fresh = getUserById(user.id) || user;
    persist(fresh, true);
  }, [user, persist]);

  const updateProfile = useCallback((updates) => {
    if (!user?.id) return null;
    try {
      const updated = updateUserProfile(user.id, updates);
      persist({ ...updated }, true);
      return updated;
    } catch {
      const merged = { ...user, ...updates };
      persist(merged, true);
      return merged;
    }
  }, [user, persist]);

  const logout = useCallback(() => {
    persist(null, false);
  }, [persist]);

  const value = useMemo(
    () => ({
      user,
      loading,
      verified,
      isAuthenticated: !!(user && verified),
      supabaseReady: supabaseOtpReady(),
      requestOtp,
      verifyOtp,
      loginOffice,
      refreshUser,
      updateProfile,
      logout,
    }),
    [user, loading, verified, requestOtp, verifyOtp, loginOffice, refreshUser, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
