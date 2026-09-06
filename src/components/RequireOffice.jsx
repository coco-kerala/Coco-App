"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/LoadingState";
import { pathForRole } from "@/lib/auth/roles";

/**
 * Office at /admin — no login page. Anyone with the link enters as Office.
 */
export function RequireOffice({ children }) {
  const { user, loading, isAuthenticated, loginOffice } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;

    (async () => {
      if (isAuthenticated && user?.role === "admin") {
        if (!cancelled) setReady(true);
        return;
      }
      if (isAuthenticated && user && user.role !== "admin") {
        router.replace(pathForRole(user.role));
        return;
      }
      const res = await loginOffice();
      if (!cancelled && res.ok) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, isAuthenticated, user, loginOffice, router]);

  if (loading || !ready) return <LoadingState />;
  if (!user || user.role !== "admin") return <LoadingState />;

  return children;
}
