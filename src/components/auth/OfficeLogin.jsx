"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** Office entry — no password / OTP. Link access is enough. */
export function OfficeLogin() {
  const router = useRouter();
  const { loginOffice } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const enter = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await loginOffice();
      if (!res.ok) {
        setError(res.error || "Could not open office");
        return;
      }
      router.replace("/admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_#eaf4e6_0%,_#f7f3eb_55%,_#efe8dc_100%)] px-5 py-10">
      <Card className="w-full max-w-sm text-center">
        <Logo size="md" className="justify-center" />
        <div className="mt-5 flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-coco-leaf-soft text-coco-leaf flex items-center justify-center">
            <Shield size={24} />
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-coco-ink">Office</h1>
        <p className="mt-2 text-base text-coco-muted leading-relaxed">
          Open the office dashboard. Send OTPs for users and partners, assign jobs, and manage bookings.
        </p>
        {error && <p className="mt-3 text-sm text-coco-danger font-medium">{error}</p>}
        <Button fullWidth size="lg" loading={loading} className="mt-6 h-14 text-base" onClick={enter}>
          Enter office
        </Button>
      </Card>
    </main>
  );
}
