"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/LoadingState";

/**
 * /admin is open to anyone with the link.
 * Switches the session to Office (does not bounce users to /user).
 */
export function RequireOffice({ children }) {
  const { user, loading, loginOffice } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (loading || started.current) return;
    if (user?.role === "admin") return;
    started.current = true;
    loginOffice().catch(() => {
      started.current = false;
    });
  }, [loading, user, loginOffice]);

  if (loading || user?.role !== "admin") {
    return <LoadingState />;
  }

  return children;
}
