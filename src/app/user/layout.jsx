"use client";

import { usePathname } from "next/navigation";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguagePicker } from "@/components/LanguagePicker";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BottomNavigation } from "@/components/customer/BottomNavigation";
import { RequireAuth } from "@/components/RequireAuth";
import { RoleManifest } from "@/components/RoleManifest";
import { InstallHomePrompt } from "@/components/InstallHomePrompt";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";

function LoginShell({ children }) {
  return (
    <div className="relative min-h-dvh">
      <RoleManifest role="user" />
      <div className="absolute top-0 right-0 z-50 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <LanguageSwitcher />
      </div>
      {children}
      <LanguagePicker />
      <InstallHomePrompt role="user" />
    </div>
  );
}

export default function CustomerLayout({ children }) {
  const pathname = usePathname();
  const isLogin = pathname?.endsWith("/login");

  return (
    <LanguageProvider role="customer">
      {isLogin ? (
        <LoginShell>{children}</LoginShell>
      ) : (
        <RequireAuth role="customer">
          <RoleManifest role="user" />
          <div className="min-h-dvh bg-coco-cream">
            <div className="mobile-shell pt-2 pb-28">{children}</div>
            <BottomNavigation />
            <InstallHomePrompt role="user" />
            <NotificationPermissionPrompt />
          </div>
          <LanguagePicker />
        </RequireAuth>
      )}
    </LanguageProvider>
  );
}
