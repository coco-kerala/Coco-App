"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { useT } from "@/contexts/LanguageContext";
import { updateUserProfile } from "@/lib/data/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { InstallAppButton } from "@/components/AddToHomeScreen";
import { User, Phone, Mail, Edit3 } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

export default function ProfilePage() {
  const { user } = useAuth();
  const { refresh } = useAppData();
  const { t } = useT();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, phone: user.phone, email: user.email });
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateUserProfile(user.id, form);
    refresh();
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageTransition>
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-coco-ink">{t("profile.title")}</h1>
          <LanguageSwitcher />
        </div>

        <div className="mt-6 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-coco-leaf-soft text-coco-green flex items-center justify-center text-2xl font-bold">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <h2 className="mt-3 text-xl font-bold text-coco-ink">{user.name}</h2>
          <p className="text-sm text-coco-muted capitalize">{user.role}</p>
        </div>

        <Card className="mt-6">
          {!editing ? (
            <div className="space-y-4">
              <InfoRow icon={User} label={t("profile.name")} value={user.name} />
              <InfoRow icon={Phone} label={t("profile.phone")} value={user.phone} />
              <InfoRow icon={Mail} label={t("profile.email")} value={user.email} />
              <Button variant="outline" fullWidth onClick={() => setEditing(true)}><Edit3 size={15} />{t("profile.editProfile")}</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {[["name", t("profile.name")], ["phone", t("profile.phone")], ["email", t("profile.email")]].map(([key, label]) => (
                <div key={key}>
                  <label className="text-sm font-semibold text-coco-ink">{label}</label>
                  <input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="mt-1 w-full h-11 rounded-xl border border-coco-border bg-coco-cream px-3" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" fullWidth onClick={() => setEditing(false)}>{t("profile.cancel")}</Button>
                <Button fullWidth onClick={save}>{t("profile.save")}</Button>
              </div>
            </div>
          )}
        </Card>

        <div className="mt-4 text-center">
          <InstallAppButton />
        </div>

        {saved && <p className="mt-3 text-center text-sm text-coco-green font-semibold animate-pulse">{t("profile.updated")}</p>}
      </div>
    </PageTransition>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl bg-coco-cream flex items-center justify-center text-coco-muted"><Icon size={16} /></div>
      <div>
        <p className="text-[11px] text-coco-muted uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm font-semibold text-coco-ink">{value}</p>
      </div>
    </div>
  );
}
