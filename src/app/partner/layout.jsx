"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LanguageProvider, useT } from "@/contexts/LanguageContext";
import { LanguagePicker } from "@/components/LanguagePicker";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { RequireAuth } from "@/components/RequireAuth";
import { Logo } from "@/components/brand/Logo";
import { NotifBell } from "@/components/NotifBell";
import { InstallHomePrompt } from "@/components/InstallHomePrompt";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import { cn } from "@/lib/utils";
import { Briefcase, MessageCircle, Headphones, User } from "lucide-react";

function LoginShell({ children }) {
  return (
    <div className="relative min-h-dvh">
      <div className="absolute top-0 right-0 z-50 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <LanguageSwitcher />
      </div>
      {children}
      <LanguagePicker />
    </div>
  );
}

function PartnerShell({ children }) {
  const pathname = usePathname();
  const { t } = useT();

  const navItems = [
    { href: "/partner", label: t("nav.jobs"), exact: true, icon: Briefcase },
    { href: "/partner/chat", label: t("nav.chat"), icon: MessageCircle },
    { href: "/partner/support", label: t("nav.support"), icon: Headphones },
    { href: "/partner/settings", label: t("nav.me"), icon: User },
  ];

  return (
    <div className="min-h-dvh bg-coco-cream">
      <div className="mobile-shell pt-2 pb-28">
        <header className="flex items-center justify-between px-5 pt-3">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <NotifBell href="/partner/notifications" />
            <LanguageSwitcher />
          </div>
        </header>
        {children}
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom pointer-events-none">
        <div className="mx-auto w-full max-w-[480px] md:max-w-[560px]">
          <div className="pointer-events-auto mx-3 mb-3 glass-nav rounded-[22px] border border-coco-border/80 shadow-[var(--shadow-soft)]">
            <div className="grid grid-cols-4 px-1 py-2">
              {navItems.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-semibold no-underline transition-colors",
                      active ? "text-coco-leaf" : "text-coco-muted"
                    )}
                  >
                    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <InstallHomePrompt />
      <NotificationPermissionPrompt />
      <LanguagePicker />
    </div>
  );
}

export default function WorkerLayout({ children }) {
  const pathname = usePathname();
  const isLogin = pathname?.endsWith("/login");

  return (
    <LanguageProvider role="worker">
      {isLogin ? (
        <LoginShell>{children}</LoginShell>
      ) : (
        <RequireAuth role="worker">
          <PartnerShell>{children}</PartnerShell>
        </RequireAuth>
      )}
    </LanguageProvider>
  );
}
