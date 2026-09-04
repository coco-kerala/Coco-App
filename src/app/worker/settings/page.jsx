"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, LogOut, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InstallAppButton } from "@/components/AddToHomeScreen";
import { PageTransition } from "@/components/PageTransition";

export default function WorkerSettingsPage() {
  const { user, updateProfile, logout, refreshUser } = useAuth();
  const { refresh } = useAppData();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateProfile({ name: name.trim() || user.name, phone: phone.trim() || user.phone });
    refreshUser();
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const doLogout = () => {
    logout();
    router.replace("/worker/login");
  };

  return (
    <PageTransition>
      <div className="px-5 pt-6 pb-8">
        <h1 className="text-2xl font-extrabold text-coco-ink">Settings</h1>
        <p className="mt-1 text-sm text-coco-muted">Update how homes see you</p>

        <div className="mt-6 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-coco-leaf-soft text-coco-green flex items-center justify-center text-2xl font-bold">
            {(user?.name || "W").split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          {user?.rating != null && (
            <div className="mt-2 flex items-center gap-1 text-amber-600 font-semibold text-sm">
              <Star size={14} className="fill-amber-400 text-amber-400" /> {user.rating}
            </div>
          )}
        </div>

        <Card className="mt-6 space-y-3">
          <div>
            <label className="text-sm font-semibold text-coco-ink flex items-center gap-1"><User size={13} /> Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full h-11 rounded-xl border border-coco-border bg-coco-cream px-3" />
          </div>
          <div>
            <label className="text-sm font-semibold text-coco-ink flex items-center gap-1"><Phone size={13} /> WhatsApp number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 w-full h-11 rounded-xl border border-coco-border bg-coco-cream px-3" />
          </div>
          <Button fullWidth onClick={save}>Save</Button>
          {saved && <p className="text-sm text-coco-green font-semibold text-center">Saved</p>}
        </Card>

        <div className="mt-8 space-y-3">
          <InstallAppButton />
          <Button variant="outline" fullWidth onClick={doLogout}>
            <LogOut size={16} /> Log out
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
