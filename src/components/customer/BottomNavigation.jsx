"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ClipboardList, Trees, User } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useT();

  const items = [
    { href: "/customer", label: t("nav.home"), icon: Home, exact: true },
    { href: "/customer/requests", label: t("nav.requests"), icon: ClipboardList },
    { href: "/customer/trees", label: t("nav.trees"), icon: Trees },
    { href: "/customer/profile", label: t("nav.profile"), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom pointer-events-none">
      <div className="mx-auto w-full max-w-[480px] md:max-w-[560px]">
        <div className="pointer-events-auto mx-3 mb-3 glass-nav rounded-[22px] border border-coco-border/80 shadow-[var(--shadow-soft)]">
          <div className="grid grid-cols-4 px-1 py-2">
            {items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-semibold no-underline transition-colors duration-200",
                    active ? "text-coco-green" : "text-coco-muted"
                  )}
                >
                  <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
