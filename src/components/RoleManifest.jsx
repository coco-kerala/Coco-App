"use client";

import { useEffect } from "react";
import { setPwaRole } from "@/components/PwaStartRedirect";

const MANIFESTS = {
  user: "/manifest-user.json",
  partner: "/manifest-partner.json",
  admin: "/manifest-admin.json",
};

/**
 * Point the page's web app manifest at this role so Install opens
 * /user, /partner, or /admin next time — not the marketing home.
 */
export function RoleManifest({ role = "user" }) {
  useEffect(() => {
    setPwaRole(role);

    const href = MANIFESTS[role] || MANIFESTS.user;
    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    // Cache-bust so Chrome picks up the role manifest
    link.setAttribute("href", `${href}?v=2`);

    let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (!appleTitle) {
      appleTitle = document.createElement("meta");
      appleTitle.setAttribute("name", "apple-mobile-web-app-title");
      document.head.appendChild(appleTitle);
    }
    appleTitle.setAttribute(
      "content",
      role === "admin" ? "KeraGo Team" : role === "partner" ? "KeraGo Pro" : "KeraGo"
    );
  }, [role]);

  return null;
}
