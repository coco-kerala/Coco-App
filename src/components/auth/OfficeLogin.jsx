"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * Office login — password only (no WhatsApp OTP).
 * Set NEXT_PUBLIC_OFFICE_PASSWORD in Vercel / .env.local (default: kerago-office).
 */
export function OfficeLogin() {
  const router = useRouter();
  const { loginOffice } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginOffice(password);
      if (!res.ok) {
        setError(res.error || "Wrong password");
        return;
      }
      router.replace("/admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_#eaf4e6_0%,_#f7f3eb_55%,_#efe8dc_100%)] px-5 py-10">
      <Card className="w-full max-w-sm">
        <Logo size="md" className="justify-center" />
        <div className="mt-5 flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-coco-leaf-soft text-coco-leaf flex items-center justify-center">
            <Shield size={24} />
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-coco-ink text-center">Office</h1>
        <p className="mt-2 text-base text-coco-muted text-center leading-relaxed">
          Enter the office password. No WhatsApp OTP needed.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-base font-semibold text-coco-ink flex items-center gap-2">
              <KeyRound size={16} /> Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Office password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full h-14 rounded-2xl border-2 border-coco-border bg-coco-cream px-4 text-base outline-none focus:border-coco-leaf"
            />
          </div>
          {error && <p className="text-sm text-coco-danger font-medium">{error}</p>}
          <Button type="submit" fullWidth size="lg" loading={loading} className="h-14 text-base">
            Open office
          </Button>
        </form>
      </Card>
    </main>
  );
}
