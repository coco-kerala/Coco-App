"use client";

import { usePathname } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  if (pathname?.endsWith("/login")) return <>{children}</>;

  return (
    <RequireAuth role="admin">
      <div className="min-h-dvh bg-coco-cream flex">
        <AdminSidebar />
        <div className="flex-1 pt-14 lg:pt-0 pb-24 lg:pb-8 overflow-x-hidden">
          {children}
        </div>
        <AdminMobileNav />
      </div>
    </RequireAuth>
  );
}
