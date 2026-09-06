"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** Fallback login hub — same customer-first paths */
export default function LoginPage() {
  const router = useRouter();
  return (
    <main className="min-h-dvh flex items-center justify-center bg-coco-cream px-5">
      <Card className="w-full max-w-sm text-center space-y-4">
        <Logo size="lg" className="justify-center" />
        <h1 className="text-2xl font-extrabold text-coco-ink">Book coconut care</h1>
        <p className="text-sm text-coco-muted leading-relaxed">
          Login and book a trained person to pluck your coconuts.
        </p>
        <Button fullWidth size="lg" onClick={() => router.push("/user/login")}>
          Continue
        </Button>
        <button
          type="button"
          onClick={() => router.push("/partner/login")}
          className="w-full text-sm font-semibold text-coco-muted py-2"
        >
          Become a partner
        </button>
      </Card>
    </main>
  );
}
