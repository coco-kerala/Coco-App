"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { resetAppData } from "@/lib/data/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageTransition } from "@/components/PageTransition";

export default function AdminSettingsPage() {
  const { refresh } = useAppData();
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
          <h2 className="font-bold text-coco-ink">Demo Data</h2>
          <p className="text-sm text-coco-muted mt-1">Reset all data back to the initial demo state. This will clear any changes you have made.</p>
          <Button variant="danger" className="mt-4" onClick={() => setShowReset(true)}>Reset All Data</Button>
          {resetDone && <p className="mt-3 text-sm text-coco-green font-semibold">Data reset successfully!</p>}
        </Card>

        <Card className="mt-4">
          <h2 className="font-bold text-coco-ink">About</h2>
          <p className="text-sm text-coco-muted mt-1">COCO — Hyperlocal Coconut Care Services</p>
          <p className="text-sm text-coco-muted">Version 1.0 · Demo Mode</p>
        </Card>

        <ConfirmDialog open={showReset} onClose={() => setShowReset(false)} onConfirm={handleReset} title="Reset Data?" message="All service requests, jobs, and changes will be lost. Sample data will be restored." confirmLabel="Reset" />
      </div>
    </PageTransition>
  );
}
