"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/LoadingState";
import { pathForRole } from "@/lib/auth/roles";

/**
 * Office at /admin — no login page. Opens dashboard for anyone with the link.
 */
export function RequireOffice({ children }) {
  const { user, loading, isAuthenticated, loginOffice } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && user?.role === "admin") {
      setReady(true);
      return;
    }

    if (isAuthenticated && user && user.role !== "admin") {
      router.replace(pathForRole(user.role));
      return;
    }

    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const res = await loginOffice();
        if (res?.ok) setReady(true);
        else setError(res?.error || "Could not open office");
      } catch (e) {
        console.error("[office]", e);
        setError("Could not open office. Tap retry.");
        started.current = false;
      }
    })();
  }, [loading, isAuthenticated, user, loginOffice, router]);

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center bg-coco-cream">
        <p className="text-lg font-bold text-coco-ink">Office could not open</p>
        <p className="mt-2 text-sm text-coco-muted">{error}</p>
        <button
          type="button"
          className="mt-6 h-12 px-6 rounded-2xl bg-coco-leaf text-white font-bold"
          onClick={() => {
            setError("");
            started.current = false;
            setReady(false);
            window.location.reload();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading || !ready || !user || user.role !== "admin") {
    return <LoadingState />;
  }

  return children;
}
