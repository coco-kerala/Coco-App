"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const ROLES = [
  { role: "customer", label: "Customer", href: "/customer" },
  { role: "worker", label: "Worker", href: "/worker" },
  { role: "admin", label: "Admin", href: "/admin" },
];

export function DemoSwitcher() {
  const pathname = usePathname();
  const { loginAs } = useAuth();

  if (!pathname || pathname === "/" || pathname === "/login") return null;

  const activeRole = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/worker")
      ? "worker"
      : pathname.startsWith("/customer")
        ? "customer"
        : null;

  if (!activeRole) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
      <div className="mx-auto max-w-lg lg:max-w-none px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pointer-events-auto">
        <div className="glass-nav rounded-2xl border border-coco-border/80 shadow-[var(--shadow-soft)] px-2 py-1.5 flex items-center gap-1">
          <Link href="/" className="shrink-0 px-2.5 py-1.5 text-[11px] font-bold text-coco-green tracking-wide no-underline">
            COCO
          </Link>
          <div className="h-4 w-px bg-coco-border" />
          <div className="flex flex-1 gap-0.5 min-w-0">
            {ROLES.map((r) => {
              const active = activeRole === r.role;
              return (
                <Link
                  key={r.role}
                  href={r.href}
                  onClick={() => loginAs(r.role)}
                  className={cn(
                    "flex-1 rounded-xl px-2 py-1.5 text-[11px] sm:text-xs font-semibold truncate text-center no-underline transition-all duration-200",
                    active
                      ? "bg-coco-green text-white shadow-sm"
                      : "bg-transparent text-coco-muted hover:bg-coco-cream hover:text-coco-ink"
                  )}
                >
                  {r.label}
                </Link>
              );
            })}
          </div>
          <span className="hidden sm:inline shrink-0 text-[10px] font-medium text-coco-muted px-2">Demo</span>
        </div>
      </div>
    </div>
  );
}
