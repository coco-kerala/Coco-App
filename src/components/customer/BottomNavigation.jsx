"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ClipboardList, MessageCircle, Headphones, User } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

/** Urban Company / Snabbit style bottom bar */
export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useT();

  const items = [
    { href: "/user", label: t("nav.home"), icon: Home, exact: true },
    { href: "/user/requests", label: t("nav.bookings"), icon: ClipboardList },
    { href: "/user/chat", label: t("nav.chat"), icon: MessageCircle },
    { href: "/user/support", label: t("nav.support"), icon: Headphones },
    { href: "/user/settings", label: t("nav.me"), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom pointer-events-none">
      <div className="mx-auto w-full max-w-[480px] md:max-w-[560px]">
        <div className="pointer-events-auto mx-3 mb-3 glass-nav rounded-[22px] border border-coco-border/80 shadow-[var(--shadow-soft)]">
          <div className="grid grid-cols-5 px-0.5 py-1.5">
            {items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-semibold no-underline transition-colors duration-200",
                    active ? "text-coco-leaf" : "text-coco-muted"
                  )}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
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
