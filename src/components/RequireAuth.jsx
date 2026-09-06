"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/LoadingState";
import { loginPathForRole, pathForRole } from "@/lib/auth/roles";

/**
 * Protects role apps. Redirects to /{path}/login when not authenticated.
 * Internal roles stay customer/worker/admin; URLs are /user /partner /admin.
 */
export function RequireAuth({ role, children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user) {
      router.replace(loginPathForRole(role));
      return;
    }
    if (user.role !== role) {
      router.replace(pathForRole(user.role));
    }
  }, [loading, isAuthenticated, user, role, router]);

  if (loading) return <LoadingState />;
  if (!isAuthenticated || !user || user.role !== role) {
    return <LoadingState />;
  }

  return children;
}
