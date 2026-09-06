"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";

/**
 * Mobile-first marketing site.
 * Customer-focused; Become a partner only in top-right.
 */
export default function LandingPage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-coco-cream text-coco-ink">
      {/* Nav */}
      <header className="relative z-20 mx-auto flex w-full max-w-5xl items-center justify-between px-4 pt-[max(0.85rem,env(safe-area-inset-top))] pb-2 sm:px-8">
        <Logo size="sm" className="sm:text-2xl" />
        <Link
          href="/partner/login"
          className="rounded-full px-3 py-2 text-xs font-semibold text-coco-muted no-underline transition-colors hover:text-coco-leaf sm:text-sm"
        >
          Become a partner
        </Link>
      </header>

      {/* Hero with photo — fills empty space on phone */}
      <section className="relative mx-auto w-full max-w-5xl px-4 sm:px-8">
        <div className="relative mt-2 overflow-hidden rounded-[28px] sm:rounded-[32px]">
          <div className="relative aspect-[4/5] w-full sm:aspect-[16/10] sm:max-h-[520px]">
            <Image
              src="/images/hero-coconut.jpg"
              alt="Coconut trees"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 pb-6 sm:p-10 sm:pb-10">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-sm"
            >
              We take care of your trees
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-2 max-w-xl font-brand text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl"
            >
              Coconut plucking,
              <br />
              <span className="text-[#b8e0a8]">made easy</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-lg"
            >
              Book from the app. We send a trained person to your home or farm —
              safe, fast, and sorted for you.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-5"
            >
              <Link
                href="/user/login"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-coco-leaf px-6 text-sm font-bold text-white no-underline shadow-lg transition hover:bg-[#326f28] active:scale-[0.98] sm:h-14 sm:w-auto sm:px-8 sm:text-base"
              >
                Book coconut care
                <ArrowRight size={18} />
              </Link>
              <p className="mt-2 text-center text-xs text-white/70 sm:text-left">
                Login with WhatsApp · Takes a minute
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works — tighter on mobile */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-16">
        <h2 className="font-brand text-2xl font-bold tracking-tight text-coco-ink sm:text-4xl">
          Everything aligned for you
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-coco-muted sm:mt-3 sm:text-base">
          From booking to the person at your gate — we handle it.
          You just open the app and ask for help.
        </p>

        <div className="mt-6 overflow-hidden rounded-3xl sm:mt-8">
          <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
            <Image
              src="/images/care-climber.jpg"
              alt="Trained partner for coconut care"
              fill
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-3 sm:gap-8">
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
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-3 sm:block"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coco-leaf-soft text-coco-leaf sm:h-11 sm:w-11">
                <item.icon size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-coco-ink sm:mt-4 sm:text-lg">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-coco-muted">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 sm:mt-12">
          <Link
            href="/user/login"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-coco-ink px-7 text-sm font-bold text-white no-underline transition hover:bg-coco-green-dark sm:w-auto"
          >
            Get started
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-5xl items-center justify-between border-t border-coco-border/60 px-4 py-6 sm:px-8">
        <Logo size="sm" />
        <p className="text-xs text-coco-muted">© KeraGo</p>
      </footer>
    </main>
  );
}
