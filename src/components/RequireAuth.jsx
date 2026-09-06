"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/LoadingState";
import { loginPathForRole } from "@/lib/auth/roles";

/**
 * Protects /user and /partner.
 * Uses that role's own saved session — visiting /admin must not steal this login.
 */
export function RequireAuth({ role, children }) {
  const { loading, switchToRole, getSessionForRole } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (loading) return;
    const sessionUser = switchToRole(role) || getSessionForRole(role);
    if (!sessionUser || sessionUser.role !== role) {
      setOk(false);
      setReady(true);
      router.replace(loginPathForRole(role));
      return;
    }
    setOk(true);
    setReady(true);
  }, [loading, role, router, switchToRole, getSessionForRole]);

  if (loading || !ready || !ok) return <LoadingState />;
  return children;
}
