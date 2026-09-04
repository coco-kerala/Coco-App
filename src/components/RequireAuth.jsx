"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/LoadingState";

/**
 * Protects role apps. Redirects to /{role}/login when not authenticated.
 */
export function RequireAuth({ role, children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user) {
      router.replace(`/${role}/login`);
      return;
    }
    if (user.role !== role) {
      router.replace(`/${user.role}`);
    }
  }, [loading, isAuthenticated, user, role, router]);

  if (loading) return <LoadingState />;
  if (!isAuthenticated || !user || user.role !== role) {
    return <LoadingState />;
  }

  return children;
}
