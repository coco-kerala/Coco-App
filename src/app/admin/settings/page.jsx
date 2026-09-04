"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { resetAppData } from "@/lib/data/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageTransition } from "@/components/PageTransition";
import { useState } from "react";
import { LogOut } from "lucide-react";

export default function AdminSettingsPage() {
  const { refresh } = useAppData();
  const { logout } = useAuth();
  const router = useRouter();
  const [showReset, setShowReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    resetAppData();
    refresh();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-5xl">
        <h1 className="text-2xl font-extrabold text-coco-ink">Settings</h1>

        <Card className="mt-5">
          <h2 className="font-bold text-coco-ink">WhatsApp OTP login</h2>
          <p className="text-sm text-coco-muted mt-1">
            Users enter their number on the customer / worker / admin login links. OTPs appear under{" "}
            <strong>OTPs</strong> — send them on WhatsApp, then the user verifies in the app.
          </p>
          <Button className="mt-4" variant="soft" onClick={() => router.push("/admin/otp")}>
            Open OTP inbox
          </Button>
        </Card>

        <Card className="mt-4">
          <h2 className="font-bold text-coco-ink">Demo Data</h2>
          <p className="text-sm text-coco-muted mt-1">Reset all data back to the initial demo state.</p>
          <Button variant="danger" className="mt-4" onClick={() => setShowReset(true)}>Reset All Data</Button>
          {resetDone && <p className="mt-3 text-sm text-coco-green font-semibold">Data reset successfully!</p>}
        </Card>

        <Card className="mt-4">
          <h2 className="font-bold text-coco-ink">Session</h2>
          <Button variant="outline" className="mt-3" onClick={() => { logout(); router.replace("/admin/login"); }}>
            <LogOut size={16} /> Log out
          </Button>
        </Card>

        <ConfirmDialog open={showReset} onClose={() => setShowReset(false)} onConfirm={handleReset} title="Reset Data?" message="All service requests, jobs, OTPs, and changes will be lost. Sample data will be restored." confirmLabel="Reset" />
      </div>
    </PageTransition>
  );
}
