"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { ensureAppData, getUserById, updateUserProfile } from "@/lib/data/store";
import {
  requestOtpBackend,
  verifyOtpBackend,
  supabaseOtpReady,
} from "@/lib/otp/supabaseBackend";

const AUTH_KEY = "coco_auth_user_id";
const AUTH_SESSION = "coco_auth_verified";
const AUTH_USER_JSON = "coco_auth_user_json";
const AuthContext = createContext(null);

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

  const requestOtp = useCallback(async (phone, role) => {
    const session = await requestOtpBackend({ phone, role });
    return {
      ok: true,
      phone: session.phone_display,
      revealOtp: role === "admin" ? session.otp_code : null,
      expiresAt: session.expires_at,
      source: supabaseOtpReady() ? "supabase" : "local",
    };
  }, []);

  const verifyOtp = useCallback(async (phone, role, code) => {
    const result = await verifyOtpBackend({ phone, role, code });
    if (!result.ok) return result;
    persist(result.user, true);
    return { ok: true, user: result.user };
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
      refreshUser,
      updateProfile,
      logout,
    }),
    [user, loading, verified, requestOtp, verifyOtp, refreshUser, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
