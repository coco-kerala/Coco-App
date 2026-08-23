"use client";

import { Logo } from "@/components/brand/Logo";
import { CoconutTreeIllustration } from "@/components/brand/CoconutTreeIllustration";
import { Card } from "@/components/ui/Card";
import { Go } from "@/components/Go";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const demos = [
  { title: "Customer App", blurb: "Request coconut plucking and track status", href: "/customer", emoji: "👤" },
  { title: "Worker App", blurb: "View jobs and update progress", href: "/worker", emoji: "🧑‍🔧" },
  { title: "Admin Panel", blurb: "Manage requests, assign workers", href: "/admin", emoji: "🛡️" },
];

const quickLinks = [
  { label: "Request a service", href: "/customer?modal=request" },
  { label: "View worker job", href: "/worker?job=job_1" },
  { label: "Track a request", href: "/customer/requests/req_1" },
  { label: "Admin: assign workers", href: "/admin/requests" },
];

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(ellipse_at_top,_#e8f3ec_0%,_#f7f3eb_55%,_#efe8dc_100%)]">
      <div className="mx-auto w-full max-w-xl px-6 pt-12 pb-20">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <span className="rounded-full bg-coco-green/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-coco-green">
              Demo
            </span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.4 }}>
          <CoconutTreeIllustration className="w-28 h-28 mt-8 -ml-2" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-coco-ink leading-[1.15]">
            COCO
          </h1>
          <p className="mt-2 text-lg text-coco-muted leading-relaxed">
            Hyperlocal coconut care services.<br />Click any card to explore the demo.
          </p>
        </motion.div>

        <div className="mt-8 space-y-3">
          {demos.map((d, i) => (
            <motion.div
              key={d.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
            >
              <Go href={d.href} className="block w-full">
                <div className="flex items-center gap-4 rounded-[18px] bg-white border border-coco-border px-5 py-4 shadow-sm hover:border-coco-green hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                  <span className="text-2xl">{d.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-coco-ink text-lg">{d.title}</p>
                    <p className="text-sm text-coco-muted mt-0.5">{d.blurb}</p>
                  </div>
                  <ArrowRight className="text-coco-green shrink-0" size={22} />
                </div>
              </Go>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.4 }}>
          <p className="mt-10 text-xs font-bold uppercase tracking-wide text-coco-muted">Quick links</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {quickLinks.map((l) => (
              <Go key={l.href} href={l.href} className="flex items-center rounded-2xl bg-coco-green/90 px-4 py-3 text-[13px] font-semibold text-white hover:bg-coco-green transition-colors active:scale-[0.97]">
                {l.label}
              </Go>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
