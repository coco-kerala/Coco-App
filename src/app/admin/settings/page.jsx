"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/PageTransition";
import { LogOut } from "lucide-react";

export default function AdminSettingsPage() {
  const { refresh } = useAppData();
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-5xl">
        <h1 className="text-2xl font-extrabold text-coco-ink">Settings</h1>

        <Card className="mt-5">
          <h2 className="font-bold text-coco-ink">WhatsApp OTP login</h2>
          <p className="text-sm text-coco-muted mt-1">
            Users and partners enter their number. Codes show under{" "}
            <strong>OTPs</strong> — send them on WhatsApp. Office opens with the private link (no password).
          </p>
          <Button className="mt-4" variant="soft" onClick={() => router.push("/admin/otp")}>
            Open OTP inbox
          </Button>
        </Card>

        <Card className="mt-4">
          <h2 className="font-bold text-coco-ink">Live data</h2>
          <p className="text-sm text-coco-muted mt-1">
            Bookings, partners, bank details, chat and alerts are saved to Supabase when connected.
            Run <code className="text-xs bg-coco-cream px-1 rounded">supabase/migrate_live_data.sql</code> once
            in the Supabase SQL Editor if you have not already.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refresh()}>
            Refresh data
          </Button>
        </Card>

        <Card className="mt-4">
          <h2 className="font-bold text-coco-ink">Session</h2>
          <Button variant="outline" className="mt-3" onClick={() => { logout(); router.replace("/admin/login"); }}>
            <LogOut size={16} /> Log out
          </Button>
        </Card>
      </div>
    </PageTransition>
  );
}
