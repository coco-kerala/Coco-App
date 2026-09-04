"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check, MessageCircle, RefreshCw, Database } from "lucide-react";
import {
  listOtpBackend,
  markOtpSentBackend,
  supabaseOtpReady,
} from "@/lib/otp/supabaseBackend";
import { buildWhatsAppOtpMessage, whatsappDeepLink, formatPhoneDisplay } from "@/lib/auth/otp";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/PageTransition";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "active", label: "Needs send" },
  { id: "all", label: "All" },
  { id: "verified", label: "Verified" },
];

export default function AdminOtpPage() {
  const [filter, setFilter] = useState("active");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const live = supabaseOtpReady();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const status = filter === "all" ? undefined : filter === "active" ? "active" : filter;
      const list = await listOtpBackend({ status });
      setSessions(list);
    } catch (err) {
      setError(err.message || "Could not load OTPs");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [refresh]);

  const copyCode = async (session) => {
    try {
      await navigator.clipboard.writeText(session.otp_code);
      setCopiedId(session.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const openWhatsApp = async (session) => {
    const text = buildWhatsAppOtpMessage({
      name: session.user_name,
      otp: session.otp_code,
      role: session.role,
    });
    await markOtpSentBackend(session.id);
    await refresh();
    window.open(whatsappDeepLink(session.phone, text), "_blank", "noopener,noreferrer");
  };

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-3xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-coco-ink">WhatsApp OTPs</h1>
            <p className="mt-1 text-sm text-coco-muted">
              Codes are generated when someone requests login. Send on WhatsApp, then they enter the same code.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh}><RefreshCw size={14} /> Refresh</Button>
        </div>

        <div className={cn(
          "mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm",
          live ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-amber-50 text-amber-900 border border-amber-100"
        )}>
          <Database size={16} className="shrink-0" />
          {live
            ? "Connected to Supabase — OTPs are saved in the database."
            : "Supabase env missing — OTPs are stored locally only."}
        </div>

        <div className="mt-5 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold",
                filter === f.id ? "bg-coco-green text-white" : "bg-white border border-coco-border text-coco-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-coco-danger font-medium">{error}</p>}

        <div className="mt-5 space-y-3">
          {loading && sessions.length === 0 ? (
            <Card><p className="text-sm text-coco-muted text-center py-6">Loading OTPs…</p></Card>
          ) : sessions.length === 0 ? (
            <Card>
              <p className="text-sm text-coco-muted text-center py-6">
                No OTP requests yet. Ask a customer/worker to enter their number on the login page.
              </p>
            </Card>
          ) : (
            sessions.map((s) => (
              <Card key={s.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wide rounded-full bg-coco-leaf-soft text-coco-green px-2 py-0.5">
                        {s.role}
                      </span>
                      <StatusPill status={s.status} />
                    </div>
                    <p className="mt-2 font-bold text-coco-ink">{s.user_name || "User"}</p>
                    <p className="text-sm text-coco-muted">{formatPhoneDisplay(s.phone)}</p>
                    <p className="mt-1 text-[11px] text-coco-muted">
                      {new Date(s.created_at).toLocaleString()} · expires {new Date(s.expires_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase text-coco-muted">OTP</p>
                    <p className="text-3xl font-extrabold tracking-[0.2em] text-coco-ink">{s.otp_code}</p>
                  </div>
                </div>
                {(s.status === "pending" || s.status === "sent") && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => openWhatsApp(s)}>
                      <MessageCircle size={14} /> Send on WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyCode(s)}>
                      {copiedId === s.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === s.id ? "Copied" : "Copy code"}
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function StatusPill({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    sent: "bg-sky-100 text-sky-800",
    verified: "bg-emerald-100 text-emerald-800",
    expired: "bg-stone-100 text-stone-500",
  };
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5", styles[status] || styles.pending)}>
      {status}
    </span>
  );
}
