"use client";

import { useLayoutEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguagePicker } from "@/components/LanguagePicker";
import { BottomNavigation } from "@/components/customer/BottomNavigation";

export default function CustomerLayout({ children }) {
  const { loginAs } = useAuth();
  useLayoutEffect(() => { loginAs("customer"); }, [loginAs]);

  return (
    <LanguageProvider role="customer">
      <div className="min-h-dvh bg-coco-cream">
        <div className="mobile-shell pt-14 pb-28">{children}</div>
        <BottomNavigation />
      </div>
      <LanguagePicker />
    </LanguageProvider>
  );
}
