"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, KeyRound, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useT } from "@/contexts/LanguageContext";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPhoneDisplay, normalizePhone } from "@/lib/auth/otp";
import { pathForRole } from "@/lib/auth/roles";

export function PhoneLogin({ role }) {
  const router = useRouter();
  const { requestOtp, verifyOtp } = useAuth();
  const { t, lang } = useT();

  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [revealed, setRevealed] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const title =
    role === "worker" ? t("auth.partnerTitle")
      : role === "admin" ? t("auth.officeTitle")
        : t("auth.userTitle");
  const blurb =
    role === "worker" ? t("auth.partnerBlurb")
      : role === "admin" ? t("auth.officeBlurb")
        : t("auth.userBlurb");
  const otpHint =
    role === "worker" ? t("auth.partnerOtpHint")
      : role === "admin" ? t("auth.officeOtpHint")
        : t("auth.userOtpHint");

  const sendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    const n = normalizePhone(phone);
    if (n.length < 10) {
      setError(t("auth.phoneInvalid"));
      return;
    }
    setLoading(true);
    try {
      const res = await requestOtp(phone, role);
      setRevealed(res.revealOtp);
      setStep("otp");
    } catch (err) {
      setError(err.message || t("auth.otpFail"));
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (String(otp).trim().length !== 6) {
      setError(t("auth.codeInvalid"));
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(phone, role, otp);
      if (!res.ok) {
        setError(res.error || t("auth.wrongCode"));
        return;
      }
      router.replace(pathForRole(role));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      key={lang}
      className="min-h-dvh flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_#eaf4e6_0%,_#f7f3eb_55%,_#efe8dc_100%)] px-5 py-10"
    >
      <Card className="w-full max-w-sm">
        <Logo size="md" className="justify-center" />
        <h1 className="mt-5 text-2xl font-extrabold text-coco-ink text-center">{title}</h1>
        <p className="mt-2 text-base text-coco-muted text-center leading-relaxed">{blurb}</p>

        {step === "phone" ? (
          <form onSubmit={sendOtp} className="mt-6 space-y-4">
            <div>
              <label className="text-base font-semibold text-coco-ink">{t("auth.phoneLabel")}</label>
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
            <Button type="submit" fullWidth size="lg" loading={loading} className="h-14 text-base">
              <Phone size={18} /> {t("auth.getOtp")}
            </Button>
            <p className="text-sm text-coco-muted text-center leading-relaxed">{otpHint}</p>
          </form>
        ) : (
          <form onSubmit={confirmOtp} className="mt-6 space-y-4">
            <p className="text-base text-coco-muted text-center">
              {t("auth.codeFor")}{" "}
              <span className="font-bold text-coco-ink">{formatPhoneDisplay(phone)}</span>
            </p>

            {revealed && (
              <div className="rounded-2xl bg-coco-leaf-soft border border-coco-leaf/20 px-4 py-4 text-center">
                <p className="text-sm font-bold text-coco-muted">{t("auth.yourCode")}</p>
                <p className="mt-1 text-4xl font-extrabold tracking-[0.25em] text-coco-leaf">{revealed}</p>
              </div>
            )}

            {!revealed && (
              <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900">
                <MessageCircle size={20} className="shrink-0 mt-0.5" />
                <span>{t("auth.openWhatsApp")}</span>
              </div>
            )}

            <div>
              <label className="text-base font-semibold text-coco-ink flex items-center gap-2">
                <KeyRound size={16} /> {t("auth.enterCode")}
              </label>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-2 w-full h-16 rounded-2xl border-2 border-coco-border bg-coco-cream px-3 text-center text-3xl tracking-[0.35em] font-bold outline-none focus:border-coco-leaf"
              />
            </div>
            {error && <p className="text-sm text-coco-danger font-medium">{error}</p>}
            <Button type="submit" fullWidth size="lg" loading={loading} className="h-14 text-lg">
              {t("auth.openApp")}
            </Button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp(""); setError(""); setRevealed(null); }}
              className="w-full text-base font-semibold text-coco-muted py-2"
            >
              {t("auth.changeNumber")}
            </button>
          </form>
        )}
      </Card>
    </main>
  );
}
