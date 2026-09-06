"use client";

import { useMemo, useState } from "react";
import { MapPin, Plus, Trash2, User, Phone, Home, LogOut, LocateFixed } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import {
  getPropertiesByCustomer,
  createProperty,
  updateProperty,
  deleteProperty,
} from "@/lib/data/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { InstallAppButton } from "@/components/AddToHomeScreen";
import { PageTransition } from "@/components/PageTransition";
import { useRouter } from "next/navigation";

export default function CustomerSettingsPage() {
  const { user, updateProfile, logout, refreshUser } = useAuth();
  const { version, refresh } = useAppData();
  const router = useRouter();
  const { locate, locating, error: locError } = useCurrentLocation();

  const properties = useMemo(
    () => (user ? getPropertiesByCustomer(user.id) : []),
    [user?.id, version]
  );

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saved, setSaved] = useState(false);
  const [editingProp, setEditingProp] = useState(null); // null | 'new' | property
  const [propForm, setPropForm] = useState(emptyProp());

  const saveProfile = () => {
    updateProfile({ name: name.trim() || user.name, phone: phone.trim() || user.phone });
    refreshUser();
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openNew = () => {
    setPropForm(emptyProp());
    setEditingProp("new");
  };

  const openEdit = (p) => {
    setPropForm({
      name: p.name,
      address: p.address,
      city: p.city || "",
      state: p.state || "",
      pincode: p.pincode || "",
      tree_count: p.tree_count || 0,
      latitude: p.latitude,
      longitude: p.longitude,
      fullAddress: "",
    });
    setEditingProp(p);
  };

  const fillLocation = async () => {
    const loc = await locate();
    if (!loc) return;
    const a = loc.address || {};
    setPropForm((f) => ({
      ...f,
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: a.line || f.address,
      city: a.city || f.city,
      state: a.state || f.state,
      pincode: a.postcode || f.pincode,
      fullAddress: a.full || "",
    }));
  };

  const saveProperty = () => {
    if (!propForm.name.trim() || !propForm.address.trim()) return;
    const payload = {
      name: propForm.name.trim(),
      address: propForm.pincode
        ? `${propForm.address.trim()} - ${propForm.pincode}`
        : propForm.address.trim(),
      city: propForm.city.trim() || "Kollam",
      state: propForm.state.trim() || "Kerala",
      pincode: propForm.pincode.trim() || null,
      tree_count: Number(propForm.tree_count) || 0,
      latitude: propForm.latitude ?? 8.8932,
      longitude: propForm.longitude ?? 76.6141,
    };

    if (editingProp === "new") {
      createProperty({ ...payload, customer_id: user.id });
    } else {
      updateProperty(editingProp.id, payload);
    }
    refresh();
    setEditingProp(null);
  };

  const removeProperty = (id) => {
    if (!confirm("Remove this address?")) return;
    deleteProperty(id);
    refresh();
  };

  const doLogout = () => {
    logout();
    router.replace("/user/login");
  };

  return (
    <PageTransition>
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-coco-ink">Settings</h1>
          <LanguageSwitcher />
        </div>
        <p className="mt-1 text-sm text-coco-muted">Manage your profile and saved addresses</p>

        <Card className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-coco-green" />
            <h2 className="font-bold text-coco-ink">Personal details</h2>
          </div>
          <div className="space-y-3">
            <Field label="Full name" value={name} onChange={setName} />
            <Field label="WhatsApp number" value={phone} onChange={setPhone} icon={Phone} />
            <Button fullWidth onClick={saveProfile}>Save profile</Button>
            {saved && <p className="text-sm text-coco-green font-semibold text-center">Saved</p>}
          </div>
        </Card>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home size={16} className="text-coco-green" />
            <h2 className="font-bold text-coco-ink">Saved addresses</h2>
          </div>
          <Button size="sm" variant="soft" onClick={openNew}><Plus size={14} /> Add</Button>
        </div>

        <div className="mt-3 space-y-3">
          {properties.length === 0 ? (
            <Card>
              <p className="text-sm text-coco-muted text-center py-4">No addresses yet. Add your home or farm.</p>
            </Card>
          ) : (
            properties.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-2">
                  <button type="button" className="text-left flex-1" onClick={() => openEdit(p)}>
                    <p className="font-bold text-coco-ink">{p.name}</p>
                    <p className="mt-1 text-sm text-coco-muted flex items-start gap-1">
                      <MapPin size={13} className="mt-0.5 shrink-0" />
                      {p.address}, {p.city}
                    </p>
                    <p className="mt-1 text-xs text-coco-muted">{p.tree_count} trees</p>
                  </button>
                  <button type="button" onClick={() => removeProperty(p.id)} className="p-2 text-coco-danger">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="mt-8 space-y-3">
          <InstallAppButton />
          <Button variant="outline" fullWidth onClick={doLogout}>
            <LogOut size={16} /> Log out
          </Button>
        </div>
      </div>

      <Modal
        open={!!editingProp}
        onClose={() => setEditingProp(null)}
        title={editingProp === "new" ? "Add address" : "Edit address"}
      >
        <div className="space-y-3">
          <Button type="button" variant="soft" fullWidth loading={locating} onClick={fillLocation}>
            <LocateFixed size={16} /> Use current location
          </Button>
          {locError && <p className="text-xs text-coco-danger">{locError}</p>}
          <Field label="Label (Home, Farm…)" value={propForm.name} onChange={(v) => setPropForm((f) => ({ ...f, name: v }))} />
          <Field label="Address / locality" value={propForm.address} onChange={(v) => setPropForm((f) => ({ ...f, address: v }))} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="City" value={propForm.city} onChange={(v) => setPropForm((f) => ({ ...f, city: v }))} />
            <Field label="PIN" value={propForm.pincode} onChange={(v) => setPropForm((f) => ({ ...f, pincode: v }))} />
          </div>
          <Field label="State" value={propForm.state} onChange={(v) => setPropForm((f) => ({ ...f, state: v }))} />
          <Field
            label="Tree count"
            value={String(propForm.tree_count)}
            onChange={(v) => setPropForm((f) => ({ ...f, tree_count: v.replace(/\D/g, "") }))}
          />
          <Button fullWidth className="mt-2" onClick={saveProperty}>Save address</Button>
        </div>
      </Modal>
    </PageTransition>
  );
}

function emptyProp() {
  return {
    name: "Home",
    address: "",
    city: "",
    state: "Kerala",
    pincode: "",
    tree_count: 0,
    latitude: null,
    longitude: null,
    fullAddress: "",
  };
}

function Field({ label, value, onChange, icon: Icon }) {
  return (
    <div>
      <label className="text-sm font-semibold text-coco-ink flex items-center gap-1">
        {Icon && <Icon size={13} />} {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full h-11 rounded-xl border border-coco-border bg-coco-cream px-3"
      />
    </div>
  );
}
