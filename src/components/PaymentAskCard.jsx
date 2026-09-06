"use client";

import { IndianRupee, Building2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useT } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

/**
 * Payment block shown at the top of job / request screens.
 * Shows amount, GPay QR/screenshot, and bank details for easy collection.
 */
export function PaymentAskCard({ amount, worker, className }) {
  const { t } = useT();
  const [copied, setCopied] = useState("");

  const bank = worker?.bank || {};
  const gpay = worker?.gpay_image;
  const upi = bank.upi || worker?.upi;

  const copyText = async (label, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  };

  if (!worker && amount == null) return null;

  return (
    <Card className={`border-2 border-coco-leaf/30 bg-gradient-to-br from-coco-leaf-soft to-white ${className || ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-9 w-9 rounded-full bg-coco-leaf text-white flex items-center justify-center">
          <IndianRupee size={18} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-coco-muted">{t("payment.title")}</p>
          <p className="text-sm text-coco-ink font-semibold">{t("payment.askPay")}</p>
        </div>
      </div>

      {amount != null && (
        <p className="text-3xl font-extrabold text-coco-ink tabular-nums">
          {formatCurrency(amount)}
        </p>
      )}

      {gpay && (
        <div className="mt-4">
          <p className="text-sm font-bold text-coco-ink mb-2">{t("payment.gpayTitle")}</p>
          <div className="rounded-2xl overflow-hidden border border-coco-border bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gpay} alt="GPay" className="w-full max-h-64 object-contain mx-auto" />
          </div>
          <p className="mt-2 text-xs text-coco-muted text-center">{t("payment.gpayHint")}</p>
        </div>
      )}

      {(upi || bank.account_number) && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-bold text-coco-ink flex items-center gap-1.5">
            <Building2 size={14} /> {t("payment.bankTitle")}
          </p>
          {upi && (
            <CopyRow
              label={t("payment.upi")}
              value={upi}
              copied={copied === "upi"}
              onCopy={() => copyText("upi", upi)}
            />
          )}
          {bank.account_name && (
            <InfoRow label={t("payment.accountName")} value={bank.account_name} />
          )}
          {bank.account_number && (
            <CopyRow
              label={t("payment.accountNumber")}
              value={bank.account_number}
              copied={copied === "ac"}
              onCopy={() => copyText("ac", bank.account_number)}
            />
          )}
          {bank.ifsc && (
            <CopyRow
              label={t("payment.ifsc")}
              value={bank.ifsc}
              copied={copied === "ifsc"}
              onCopy={() => copyText("ifsc", bank.ifsc)}
            />
          )}
          {bank.bank_name && <InfoRow label={t("payment.bankName")} value={bank.bank_name} />}
        </div>
      )}

      {!gpay && !upi && !bank.account_number && (
        <p className="mt-3 text-sm text-coco-muted">{t("payment.noDetails")}</p>
      )}
    </Card>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-coco-muted">{label}</span>
      <span className="font-semibold text-coco-ink text-right">{value}</span>
    </div>
  );
}

function CopyRow({ label, value, onCopy, copied }) {
  return (
    <button type="button" onClick={onCopy} className="w-full flex items-center justify-between gap-3 text-sm text-left rounded-xl bg-white border border-coco-border px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] text-coco-muted font-medium">{label}</p>
        <p className="font-bold text-coco-ink truncate">{value}</p>
      </div>
      {copied ? <Check size={16} className="text-coco-leaf shrink-0" /> : <Copy size={16} className="text-coco-muted shrink-0" />}
    </button>
  );
}
