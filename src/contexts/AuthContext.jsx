"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { SAMPLE_USERS } from "@/lib/data/sample-data";
import { ensureDemoData } from "@/lib/data/store";

const AUTH_KEY = "coco_auth_user_id";
const AuthContext = createContext(null);
const DEFAULT_USER = SAMPLE_USERS.find((u) => u.role === "customer");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);

  useEffect(() => {
    ensureDemoData();
    try {
      const id = localStorage.getItem(AUTH_KEY);
      if (id) {
        const found = SAMPLE_USERS.find((u) => u.id === id);
        if (found) setUser(found);
      }
    } catch {}
  }, []);

  const loginAs = useCallback((role) => {
    const match = SAMPLE_USERS.find((u) => u.role === role) || DEFAULT_USER;
    try { localStorage.setItem(AUTH_KEY, match.id); } catch {}
    setUser(match);
  }, []);

  const loginAsUser = useCallback((userId) => {
    const match = SAMPLE_USERS.find((u) => u.id === userId) || DEFAULT_USER;
    try { localStorage.setItem(AUTH_KEY, match.id); } catch {}
    setUser(match);
  }, []);

  const logout = useCallback(() => {
    try { localStorage.removeItem(AUTH_KEY); } catch {}
    setUser(DEFAULT_USER);
  }, []);

  const value = useMemo(() => ({ user, loading: false, loginAs, loginAsUser, logout }), [user, loginAs, loginAsUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
