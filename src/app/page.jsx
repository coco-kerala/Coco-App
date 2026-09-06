"use client";

import Link from "next/link";
import { ArrowRight, Home, Leaf, ShieldCheck, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";

/**
 * Public marketing site for kerago.in
 * Primary: become a User (book coconut care)
 * Secondary: become a Partner
 */
export default function LandingPage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-coco-cream text-coco-ink">
      {/* Atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_10%_-10%,#d8ecd0_0%,transparent_55%),radial-gradient(ellipse_90%_70%_at_100%_0%,#f0e0c8_0%,transparent_50%),linear-gradient(180deg,#f7f3eb_0%,#efe8dc_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a1f1c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2 sm:px-8">
        <Logo size="md" />
        <Link
          href="/partner/login"
          className="text-sm font-semibold text-coco-muted no-underline hover:text-coco-leaf transition-colors"
        >
          Partner login
        </Link>
      </header>

      {/* Hero — one composition: brand + purpose + primary CTA */}
      <section className="relative mx-auto flex min-h-[78dvh] w-full max-w-5xl flex-col justify-center px-5 pb-10 pt-6 sm:px-8 sm:pt-10">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold uppercase tracking-[0.18em] text-coco-shell"
        >
          Coconut care, near you
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mt-3 max-w-2xl font-brand text-[clamp(2.75rem,9vw,4.5rem)] font-bold leading-[1.05] tracking-tight"
        >
          <span className="text-coco-shell">Kera</span>
          <span className="text-coco-leaf">Go</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-5 max-w-xl text-lg leading-relaxed text-coco-muted sm:text-xl"
        >
          Book a trained person to pluck your coconuts — safe, simple, and on your time.
          Talk on WhatsApp. Pay with GPay. Done.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href="/user/login"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-coco-leaf px-8 text-base font-bold text-white no-underline shadow-[0_12px_28px_rgba(58,125,46,0.28)] transition hover:bg-[#326f28] active:scale-[0.98]"
          >
            Become a user
            <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-coco-muted sm:ml-2">
            For homes &amp; farms — book coconut plucking
          </p>
        </motion.div>

        {/* Soft leaf motif */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="pointer-events-none absolute right-[-8%] top-[18%] hidden h-64 w-64 rounded-full bg-coco-leaf/10 blur-3xl sm:block"
          aria-hidden
        />
      </section>

      {/* How it works */}
      <section className="border-t border-coco-border/70 bg-white/50">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
          <h2 className="font-brand text-3xl font-bold tracking-tight text-coco-ink sm:text-4xl">
            How KeraGo helps
          </h2>
          <p className="mt-3 max-w-2xl text-base text-coco-muted leading-relaxed">
            Finding a safe climber is hard. KeraGo connects your home with trusted partners,
            and the office makes sure the job is done right.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Home,
                title: "You book",
                text: "Say how many trees and when. We get your request on WhatsApp OTP login.",
              },
              {
                icon: Leaf,
                title: "Partner comes",
                text: "A trained partner is assigned. Track when they are on the way and working.",
              },
              {
                icon: Smartphone,
                title: "You pay easy",
                text: "See GPay QR and bank details in the app. Confirm when the work is done.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coco-leaf-soft text-coco-leaf">
                  <item.icon size={22} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-coco-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-coco-muted">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner — secondary path */}
      <section className="border-t border-coco-border/70">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-14 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-16">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-coco-shell">For climbers</p>
            <h2 className="mt-2 font-brand text-3xl font-bold tracking-tight text-coco-ink">
              Become a partner
            </h2>
            <p className="mt-3 text-base leading-relaxed text-coco-muted">
              Get jobs near you. Go to the home, finish the work, and get paid.
              Add your bank / GPay in the app so money reaches you fast.
            </p>
          </div>
          <Link
            href="/partner/login"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-coco-ink bg-transparent px-6 text-sm font-bold text-coco-ink no-underline transition hover:bg-coco-ink hover:text-white"
          >
            Partner login
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-coco-border/70 bg-coco-ink text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:gap-8 sm:px-8">
          <ShieldCheck className="shrink-0 text-coco-leaf" size={28} />
          <p className="text-sm leading-relaxed text-white/80 sm:text-base">
            Built for Kerala homes and farms. Login with your WhatsApp number.
            Install KeraGo on your phone home screen for one-tap open.
          </p>
        </div>
      </section>

      <footer className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 text-sm text-coco-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo size="sm" />
        <div className="flex flex-wrap gap-4">
          <Link href="/user/login" className="font-semibold text-coco-leaf no-underline">
            User login
          </Link>
          <Link href="/partner/login" className="font-semibold no-underline hover:text-coco-ink">
            Partner login
          </Link>
          <Link href="/admin/login" className="no-underline opacity-50 hover:opacity-100">
            Office
          </Link>
        </div>
      </footer>
    </main>
  );
}
