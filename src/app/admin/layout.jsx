"use client";

import { RequireOffice } from "@/components/RequireOffice";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/AdminSidebar";
import { NotifBell } from "@/components/NotifBell";
import { InstallHomePrompt } from "@/components/InstallHomePrompt";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";

export default function AdminLayout({ children }) {
  return (
    <RequireOffice>
      <div className="min-h-dvh bg-coco-cream flex">
        <AdminSidebar />
        <div className="flex-1 pt-2 lg:pt-0 pb-24 lg:pb-8 overflow-x-hidden min-w-0">
          <div className="flex justify-end px-5 pt-3 lg:px-8">
            <NotifBell href="/admin/notifications" />
          </div>
          {children}
        </div>
        <AdminMobileNav />
        {/* Delay prompts so dashboard paints first (avoids mobile tab crash) */}
        <InstallHomePrompt delayMs={2500} forcePhoneOnly={false} />
        <NotificationPermissionPrompt delayMs={4500} />
      </div>
    </RequireOffice>
  );
}
