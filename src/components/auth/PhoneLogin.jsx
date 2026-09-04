"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, KeyRound, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPhoneDisplay, normalizePhone } from "@/lib/auth/otp";

const ROLE_COPY = {
  customer: {
    title: "Book care",
    blurb: "Book coconut plucking for your home or farm.",
    home: "/customer",
    demoName: "Ananya (demo)",
  },
  worker: {
    title: "Partner",
    blurb: "See your jobs. Go. Finish. Get paid.",
    home: "/worker",
    demoName: "Ravi (demo)",
  },
  admin: {
    title: "Office",
    blurb: "Send OTPs and assign partners.",
    home: "/admin",
    demoName: "Priya (demo)",
  },
};

export function PhoneLogin({ role }) {
  const router = useRouter();
  const { requestOtp, verifyOtp, loginAs } = useAuth();
  const copy = ROLE_COPY[role];

  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [revealed, setRevealed] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    const n = normalizePhone(phone);
    if (n.length < 10) {
      setError("Enter your 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await requestOtp(phone, role);
      setRevealed(res.revealOtp);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Could not create OTP");
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (String(otp).trim().length !== 6) {
      setError("Enter the 6-digit code from WhatsApp");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(phone, role, otp);
      if (!res.ok) {
        setError(res.error || "Wrong code. Try again.");
        return;
      }
      router.replace(copy.home);
    } finally {
      setLoading(false);
    }
  };

  const demoEnter = () => {
    loginAs(role);
    router.replace(copy.home);
  };

  return (
    <main className="min-h-dvh flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_#e8f3ec_0%,_#f7f3eb_55%,_#efe8dc_100%)] px-5 py-10">
      <Card className="w-full max-w-sm">
        <Logo size="md" className="justify-center" />
        <h1 className="mt-5 text-2xl font-extrabold text-coco-ink text-center">{copy.title}</h1>
        <p className="mt-2 text-base text-coco-muted text-center leading-relaxed">{copy.blurb}</p>

        {/* Big demo button first — easy for workers */}
        <Button fullWidth size="lg" className="mt-6 h-14 text-lg" onClick={demoEnter}>
          Open demo → {copy.demoName}
        </Button>
        <p className="mt-2 text-center text-xs text-coco-muted">No OTP needed for demo</p>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-coco-border" />
          <span className="text-xs font-bold text-coco-muted uppercase">or login</span>
          <div className="h-px flex-1 bg-coco-border" />
        </div>

        {step === "phone" ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="text-base font-semibold text-coco-ink">Your WhatsApp number</label>
              <div className="mt-2 flex rounded-2xl border-2 border-coco-border bg-coco-cream overflow-hidden">
                <span className="px-4 flex items-center text-base font-bold text-coco-muted border-r border-coco-border">+91</span>
                <input
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, "").slice(0, 12))}
                  className="flex-1 h-14 bg-transparent px-3 text-lg outline-none"
                />
              </div>
            </div>
            {error && <p className="text-sm text-coco-danger font-medium">{error}</p>}
            <Button type="submit" fullWidth size="lg" variant="outline" loading={loading} className="h-14 text-base">
              <Phone size={18} /> Get OTP on WhatsApp
            </Button>
            <p className="text-sm text-coco-muted text-center leading-relaxed">
              {role === "worker"
                ? "COCO office will send you a code on WhatsApp. Enter that code next."
                : role === "admin"
                  ? "You will see the code next — send it on WhatsApp if needed."
                  : "We will WhatsApp you a 6-digit code. Enter it on the next screen."}
            </p>
          </form>
        ) : (
          <form onSubmit={confirmOtp} className="space-y-4">
            <p className="text-base text-coco-muted text-center">
              Code for <span className="font-bold text-coco-ink">{formatPhoneDisplay(phone)}</span>
            </p>

            {revealed && (
              <div className="rounded-2xl bg-coco-leaf-soft border border-coco-green/20 px-4 py-4 text-center">
                <p className="text-sm font-bold text-coco-muted">Your code</p>
                <p className="mt-1 text-4xl font-extrabold tracking-[0.25em] text-coco-green">{revealed}</p>
              </div>
            )}

            {!revealed && (
              <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900">
                <MessageCircle size={20} className="shrink-0 mt-0.5" />
                <span>Open WhatsApp. Find the COCO message. Type the 6 numbers below.</span>
              </div>
            )}

            <div>
              <label className="text-base font-semibold text-coco-ink flex items-center gap-2">
                <KeyRound size={16} /> Enter code
              </label>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-2 w-full h-16 rounded-2xl border-2 border-coco-border bg-coco-cream px-3 text-center text-3xl tracking-[0.35em] font-bold outline-none focus:border-coco-green"
              />
            </div>
            {error && <p className="text-sm text-coco-danger font-medium">{error}</p>}
            <Button type="submit" fullWidth size="lg" loading={loading} className="h-14 text-lg">
              Open app
            </Button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp(""); setError(""); setRevealed(null); }}
              className="w-full text-base font-semibold text-coco-muted py-2"
            >
              Change number
            </button>
          </form>
        )}
      </Card>
    </main>
  );
}
