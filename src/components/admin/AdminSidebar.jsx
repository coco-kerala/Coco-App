"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ClipboardList, Briefcase, Users, UserCheck, MapPin, CreditCard, BarChart3, Settings } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/workers", label: "Workers", icon: UserCheck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/properties", label: "Properties", icon: MapPin },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-coco-border bg-white h-dvh sticky top-0">
      <div className="p-5 border-b border-coco-border">
        <Logo size="sm" />
        <p className="mt-1 text-[11px] font-medium text-coco-muted uppercase tracking-wide">Admin Panel</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all duration-150",
                active ? "bg-coco-green text-white shadow-sm" : "text-coco-muted hover:bg-coco-leaf-soft hover:text-coco-ink"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="mx-2 mb-2 glass-nav rounded-2xl border border-coco-border/80 shadow-[var(--shadow-soft)] overflow-x-auto">
        <div className="flex px-2 py-2 gap-1 min-w-max">
          {navItems.slice(0, 5).map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold no-underline min-w-[56px]",
                  active ? "text-coco-green" : "text-coco-muted"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
