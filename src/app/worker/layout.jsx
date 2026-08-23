"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageProvider, useT } from "@/contexts/LanguageContext";
import { LanguagePicker } from "@/components/LanguagePicker";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { Briefcase, User } from "lucide-react";

function WorkerShell({ children }) {
  const { loginAs } = useAuth();
  const pathname = usePathname();
  const { t } = useT();

  useLayoutEffect(() => { loginAs("worker"); }, [loginAs]);

  const navItems = [
    { href: "/worker", label: t("nav.jobs"), exact: true, icon: Briefcase },
    { href: "/worker/profile", label: t("nav.profile"), icon: User },
  ];

  return (
    <div className="min-h-dvh bg-coco-cream">
      <div className="mobile-shell pt-14 pb-24">
        <header className="flex items-center justify-between px-5 pt-3">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <span className="text-xs font-semibold text-coco-muted">{t("worker.workerLabel")}</span>
          </div>
        </header>
        {children}
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom pointer-events-none">
        <div className="mx-auto w-full max-w-[480px] md:max-w-[560px]">
          <div className="pointer-events-auto mx-3 mb-3 glass-nav rounded-[22px] border border-coco-border/80 shadow-[var(--shadow-soft)]">
            <div className="grid grid-cols-2 px-1 py-2">
              {navItems.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-semibold no-underline transition-colors", active ? "text-coco-green" : "text-coco-muted")}>
                    <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <LanguagePicker />
    </div>
  );
}

export default function WorkerLayout({ children }) {
  return (
    <LanguageProvider role="worker">
      <WorkerShell>{children}</WorkerShell>
    </LanguageProvider>
  );
}
