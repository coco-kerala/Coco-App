"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const ROLE_KEY = "kerago_pwa_role";

export function getPwaRole() {
  try {
    return localStorage.getItem(ROLE_KEY);
  } catch {
    return null;
  }
}

export function setPwaRole(role) {
  try {
    if (role) localStorage.setItem(ROLE_KEY, role);
  } catch {}
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

/**
 * If the installed app opens on `/`, send them to the role they installed for.
 */
export function PwaStartRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isStandalone()) return;
    if (pathname !== "/" && pathname !== "") return;
    const role = getPwaRole();
    if (role === "admin") router.replace("/admin");
    else if (role === "partner") router.replace("/partner");
    else if (role === "user") router.replace("/user");
  }, [pathname, router]);

  return null;
}
