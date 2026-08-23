"use client";

import { ArrowRight } from "lucide-react";
import { QueryNavForm } from "@/components/QueryNavForm";
import { useT } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function ServiceCard({ className }) {
  const { t } = useT();

  return (
    <QueryNavForm action="/customer" params={{ modal: "request" }} className="block w-full">
      <button type="submit" className="block w-full text-left border-0 bg-transparent p-0 cursor-pointer">
        <Card
          padding="lg"
          className={cn(
            "relative overflow-hidden bg-gradient-to-br from-coco-green to-coco-green-light text-white border-0 shadow-[var(--shadow-soft)] active:scale-[0.98] transition-transform",
            className
          )}
        >
          <div className="absolute -right-6 -top-8 opacity-20 pointer-events-none">
            <svg width="140" height="140" viewBox="0 0 48 48" fill="none">
              <path d="M24 22c-4.5-1.5-8.5-5-10-9 5.5 1.5 9 5 10 9Z" fill="white" />
              <path d="M24 22c4.5-1.5 8.5-5 10-9-5.5 1.5-9 5-10 9Z" fill="white" />
              <path d="M24 22c-2-4.5-2-9.5 0-13 1.5 4 1.5 9 0 13Z" fill="white" />
            </svg>
          </div>
          <div className="relative">
            <div className="text-3xl mb-3">🌴</div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{t("customer.coconutPlucking")}</h2>
            <p className="mt-2 text-white/80 text-[15px] leading-relaxed max-w-[280px]">{t("customer.serviceDesc")}</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 h-11 text-coco-green font-semibold text-[15px] shadow-sm">
              {t("customer.requestService")}
              <ArrowRight size={18} />
            </div>
          </div>
        </Card>
      </button>
    </QueryNavForm>
  );
}
