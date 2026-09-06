"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

/** Bell with unread badge — links to notifications page */
export function NotifBell({ href, className }) {
  const { unread } = useNotifications();
  const { t } = useT();

  return (
    <Link
      href={href}
      aria-label={t("notif.title")}
      className={cn(
        "relative h-10 w-10 rounded-full bg-white border border-coco-border flex items-center justify-center text-coco-ink no-underline",
        className
      )}
    >
      <Bell size={18} />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-coco-danger text-white text-[10px] font-bold flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
