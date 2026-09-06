"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";

/**
 * Public marketing site — customer-first (Urban Company / Snabbit style).
 * Sell: we help you pluck coconuts. Book in the app.
 * Partner is only a quiet top-right link. No office/admin on this page.
 */
export default function LandingPage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-coco-cream text-coco-ink">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_15%_-5%,#d4e8c8_0%,transparent_50%),radial-gradient(ellipse_80%_60%_at_95%_10%,#f2dfc4_0%,transparent_45%),linear-gradient(180deg,#f7f3eb_0%,#efe8dc_100%)]" />
      </div>

      {/* Nav: brand left · Become a partner right only */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2 sm:px-8">
        <Logo size="md" />
        <Link
          href="/partner/login"
          className="text-sm font-semibold text-coco-muted no-underline transition-colors hover:text-coco-leaf"
        >
          Become a partner
        </Link>
      </header>

      {/* Hero — one job: we take care of your trees / book plucking */}
      <section className="relative mx-auto flex min-h-[82dvh] w-full max-w-5xl flex-col justify-center px-5 pb-12 pt-8 sm:px-8 sm:pt-14">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-coco-shell"
        >
          We take care of your trees
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-4 max-w-3xl font-brand text-[clamp(2.6rem,8.5vw,4.25rem)] font-bold leading-[1.08] tracking-tight text-coco-ink"
        >
          Coconut plucking,
          <br />
          <span className="text-coco-leaf">made easy</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-5 max-w-xl text-lg leading-relaxed text-coco-muted sm:text-xl"
        >
          Book from the app. We send a trained person to your home or farm.
          Safe, fast, and sorted for you — so you don’t have to search or chase anyone.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10"
        >
          <Link
            href="/user/login"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-coco-leaf px-9 text-base font-bold text-white no-underline shadow-[0_14px_32px_rgba(58,125,46,0.3)] transition hover:bg-[#326f28] active:scale-[0.98]"
          >
            Book coconut care
            <ArrowRight size={20} />
          </Link>
          <p className="mt-3 text-sm text-coco-muted">
            Login with WhatsApp · Takes a minute
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.9 }}
          className="pointer-events-none absolute -right-16 top-24 hidden h-72 w-72 rounded-full bg-coco-leaf/15 blur-3xl sm:block"
          aria-hidden
        />
      </section>

      {/* Why book with us */}
      <section className="border-t border-coco-border/60 bg-white/55">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="font-brand text-3xl font-bold tracking-tight text-coco-ink sm:text-4xl">
            Everything aligned for you
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-coco-muted">
            From booking to the person arriving at your gate — we handle it.
            You just open the app and ask for help.
          </p>

          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              {
                icon: CalendarCheck,
                title: "Book in minutes",
                text: "Tell us your trees and preferred time. That’s it.",
              },
              {
                icon: MapPin,
                title: "We send someone",
                text: "A trained climber comes to your place. Track the job in the app.",
              },
              {
                icon: Sparkles,
                title: "Done smart & fast",
                text: "Pay with GPay when the work is finished. Simple and clear.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-coco-leaf-soft text-coco-leaf">
                  <item.icon size={20} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-coco-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-coco-muted">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-14">
            <Link
              href="/user/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-coco-ink px-7 text-sm font-bold text-white no-underline transition hover:bg-coco-green-dark"
            >
              Get started
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-5xl items-center justify-between px-5 py-8 sm:px-8">
        <Logo size="sm" />
        <p className="text-xs text-coco-muted">© KeraGo</p>
      </footer>
    </main>
  );
}
