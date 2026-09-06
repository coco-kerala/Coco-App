"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, LogOut, Star, Building2, Upload, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { useT } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InstallAppButton } from "@/components/AddToHomeScreen";
import { PageTransition } from "@/components/PageTransition";

export default function WorkerSettingsPage() {
  const { user, updateProfile, logout, refreshUser } = useAuth();
  const { refresh } = useAppData();
  const { t } = useT();
  const router = useRouter();
  const fileRef = useRef(null);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bank, setBank] = useState({
    account_name: user?.bank?.account_name || "",
    account_number: user?.bank?.account_number || "",
    ifsc: user?.bank?.ifsc || "",
    bank_name: user?.bank?.bank_name || "",
    upi: user?.bank?.upi || user?.upi || "",
  });
  const [gpayImage, setGpayImage] = useState(user?.gpay_image || null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateProfile({
      name: name.trim() || user.name,
      phone: phone.trim() || user.phone,
      bank: {
        account_name: bank.account_name.trim(),
        account_number: bank.account_number.trim(),
        ifsc: bank.ifsc.trim().toUpperCase(),
        bank_name: bank.bank_name.trim(),
        upi: bank.upi.trim(),
      },
      upi: bank.upi.trim(),
      gpay_image: gpayImage,
    });
    refreshUser();
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onGpayFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert(t("payment.imageTooBig"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setGpayImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const doLogout = () => {
    logout();
    router.replace("/partner/login");
  };

  return (
    <PageTransition>
      <div className="px-5 pt-6 pb-8">
        <h1 className="text-2xl font-extrabold text-coco-ink">{t("profile.title")}</h1>
        <p className="mt-1 text-sm text-coco-muted">{t("payment.settingsHint")}</p>

        <div className="mt-6 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-coco-leaf-soft text-coco-green flex items-center justify-center text-2xl font-bold">
            {(user?.name || "P").split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          {user?.rating != null && (
            <div className="mt-2 flex items-center gap-1 text-amber-600 font-semibold text-sm">
              <Star size={14} className="fill-amber-400 text-amber-400" /> {user.rating}
            </div>
          )}
        </div>

        {/* Payment first */}
        <Card className="mt-6 space-y-3 border-2 border-coco-leaf/25">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-coco-leaf" />
            <h2 className="font-bold text-coco-ink">{t("payment.bankTitle")}</h2>
          </div>
          <p className="text-xs text-coco-muted">{t("payment.bankHint")}</p>

          <Field label={t("payment.upi")} value={bank.upi} onChange={(v) => setBank((b) => ({ ...b, upi: v }))} placeholder="name@oksbi" />
          <Field label={t("payment.accountName")} value={bank.account_name} onChange={(v) => setBank((b) => ({ ...b, account_name: v }))} />
          <Field label={t("payment.accountNumber")} value={bank.account_number} onChange={(v) => setBank((b) => ({ ...b, account_number: v }))} />
          <Field label={t("payment.ifsc")} value={bank.ifsc} onChange={(v) => setBank((b) => ({ ...b, ifsc: v.toUpperCase() }))} placeholder="SBIN0001234" />
          <Field label={t("payment.bankName")} value={bank.bank_name} onChange={(v) => setBank((b) => ({ ...b, bank_name: v }))} />

          <div>
            <p className="text-sm font-semibold text-coco-ink mb-2">{t("payment.gpayUpload")}</p>
            <p className="text-xs text-coco-muted mb-2">{t("payment.gpayUploadHint")}</p>
            {gpayImage ? (
              <div className="relative rounded-2xl border border-coco-border overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gpayImage} alt="GPay" className="w-full max-h-48 object-contain" />
                <button
                  type="button"
                  onClick={() => setGpayImage(null)}
                  className="absolute top-2 right-2 h-9 w-9 rounded-full bg-white border border-coco-border flex items-center justify-center text-coco-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-28 rounded-2xl border-2 border-dashed border-coco-border flex flex-col items-center justify-center gap-2 text-coco-muted"
              >
                <Upload size={22} />
                <span className="text-sm font-semibold">{t("payment.addGpay")}</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onGpayFile} />
          </div>
        </Card>

        <Card className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-semibold text-coco-ink flex items-center gap-1"><User size={13} /> {t("profile.name")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full h-11 rounded-xl border border-coco-border bg-coco-cream px-3" />
          </div>
          <div>
            <label className="text-sm font-semibold text-coco-ink flex items-center gap-1"><Phone size={13} /> {t("profile.phone")}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 w-full h-11 rounded-xl border border-coco-border bg-coco-cream px-3" />
          </div>
        </Card>

        <Button fullWidth className="mt-4 h-12" onClick={save}>{t("profile.save")}</Button>
        {saved && <p className="mt-2 text-sm text-coco-green font-semibold text-center">{t("profile.updated")}</p>}

        <div className="mt-8 space-y-3">
          <InstallAppButton />
          <Button variant="outline" fullWidth onClick={doLogout}>
            <LogOut size={16} /> {t("payment.logout")}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-semibold text-coco-ink">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full h-11 rounded-xl border border-coco-border bg-coco-cream px-3"
      />
    </div>
  );
}
