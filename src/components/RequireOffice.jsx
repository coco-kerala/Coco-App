"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/LoadingState";

/**
 * /admin is open to anyone with the link.
 * Saves Office in its own session slot — does not wipe user/partner logins.
 */
export function RequireOffice({ children }) {
  const { loading, user, loginOffice, switchToRole, getSessionForRole } = useAuth();
  const started = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;

    const existing = switchToRole("admin") || getSessionForRole("admin");
    const needsFresh =
      !existing ||
      existing.role !== "admin" ||
      String(existing.id || "").startsWith("usr_");

    if (!needsFresh) {
      setReady(true);
      return;
    }

    if (started.current) return;
    started.current = true;
    loginOffice()
      .then(() => setReady(true))
      .catch(() => {
        started.current = false;
        setReady(false);
      });
  }, [loading, loginOffice, switchToRole, getSessionForRole]);

  if (
    loading ||
    !ready ||
    user?.role !== "admin" ||
    String(user?.id || "").startsWith("usr_")
  ) {
    return <LoadingState />;
  }

  return children;
}
