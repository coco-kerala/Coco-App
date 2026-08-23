"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const { loginAs } = useAuth();
  useEffect(() => { loginAs("admin"); }, [loginAs]);

  return (
    <div className="min-h-dvh bg-coco-cream flex">
      <AdminSidebar />
      <div className="flex-1 pt-14 lg:pt-0 pb-24 lg:pb-8 overflow-x-hidden">
        {children}
      </div>
      <AdminMobileNav />
    </div>
  );
}
