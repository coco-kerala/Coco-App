"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { CoconutTreeIllustration } from "@/components/brand/CoconutTreeIllustration";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const apps = [
  {
    role: "customer",
    title: "Book care",
    blurb: "For your home or farm — book coconut plucking",
    href: "/user",
    loginHref: "/user/login",
    emoji: "🏠",
    color: "bg-coco-green text-white",
  },
  {
    role: "worker",
    title: "Partner",
    blurb: "See jobs · go there · finish · get paid",
    href: "/partner",
    loginHref: "/partner/login",
    emoji: "🌴",
    color: "bg-coco-ink text-white",
  },
  {
    role: "admin",
    title: "Office",
    blurb: "Send OTP · assign partners · manage jobs",
    href: "/admin",
    loginHref: "/admin/login",
    emoji: "🛡️",
    color: "bg-white text-coco-ink border border-coco-border",
  },
];

export default function LandingPage() {
  const { loginAs } = useAuth();
  const router = useRouter();

  const openDemo = (app) => {
    loginAs(app.role);
    router.push(app.href);
  };

  return (
    <main className="min-h-dvh bg-[radial-gradient(ellipse_at_top,_#e8f3ec_0%,_#f7f3eb_55%,_#efe8dc_100%)]">
      <div className="mx-auto w-full max-w-xl px-6 pt-12 pb-20">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Logo size="md" />
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <CoconutTreeIllustration className="w-28 h-28 mt-8 -ml-2" />
        </motion.div>

        <h1 className="mt-2 text-4xl font-brand font-bold tracking-tight leading-[1.15]">
          <span className="text-coco-shell">Kera</span>
          <span className="text-coco-leaf">Go</span>
        </h1>
        <p className="mt-2 text-lg text-coco-muted leading-relaxed">
          Coconut care made simple.
        </p>

        <p className="mt-8 text-xs font-bold uppercase tracking-wide text-coco-muted">Try demo (one tap)</p>
        <div className="mt-3 space-y-3">
          {apps.map((app, i) => (
            <motion.div
              key={app.role}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
            >
              <button
                type="button"
                onClick={() => openDemo(app)}
                className={`w-full flex items-center gap-4 rounded-[20px] px-5 py-5 text-left shadow-sm active:scale-[0.98] transition-transform ${app.color}`}
              >
                <span className="text-3xl">{app.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-xl">{app.title}</p>
                  <p className={`text-sm mt-0.5 ${app.role === "admin" ? "text-coco-muted" : "opacity-80"}`}>
                    {app.blurb}
                  </p>
                </div>
                <ArrowRight size={22} className="shrink-0 opacity-80" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-white/70 border border-coco-border px-4 py-4">
          <p className="text-sm font-bold text-coco-ink">Real login (WhatsApp OTP)</p>
          <p className="mt-1 text-xs text-coco-muted leading-relaxed">
            For live use: enter number → admin sends OTP on WhatsApp → enter code.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {apps.map((app) => (
              <button
                key={app.loginHref}
                type="button"
                onClick={() => router.push(app.loginHref)}
                className="rounded-xl bg-coco-cream border border-coco-border py-2.5 text-xs font-bold text-coco-ink active:scale-95"
              >
                {app.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
