"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Calendar, Clock, ChevronLeft, CheckCircle2, LocateFixed, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { createProperty, createServiceRequest, getPropertiesByCustomer } from "@/lib/data/store";
import { calculateServicePrice } from "@/lib/pricing";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PropertyCard } from "@/components/customer/PropertyCard";
import { Modal } from "@/components/ui/Modal";
import { useT } from "@/contexts/LanguageContext";

const TIME_WINDOWS = ["07:00", "08:30", "10:00", "11:30", "14:00", "16:00"];

const STEP_KEYS = {
  1: "request.chooseService",
  2: "request.treeCount",
  3: "request.property",
  4: "request.dateTime",
  5: "request.review",
};

export function RequestServiceModal({ open, onClose }) {
  const { user } = useAuth();
  const { refresh } = useAppData();
  const { t } = useT();
  const [step, setStep] = useState(1);
  const [treeCount, setTreeCount] = useState(4);
  const [propertyId, setPropertyId] = useState(null);
  const [date, setDate] = useState("2026-08-23");
  const [time, setTime] = useState("08:30");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newProp, setNewProp] = useState({
    name: "",
    address: "",
    city: "Kollam",
    state: "Kerala",
    pincode: "",
    fullAddress: "",
    latitude: null,
    longitude: null,
    tree_count: 5,
  });
  const [properties, setProperties] = useState([]);
  const { locate, locating, error: locationError } = useCurrentLocation();

  useEffect(() => {
    if (!open) return;
    const props = getPropertiesByCustomer(user.id);
    setProperties(props);
    if (props[0]) setPropertyId(props[0].id);
  }, [user.id, open]);

  const selectedProperty = properties.find((p) => p.id === propertyId);
  const price = calculateServicePrice(treeCount);

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => { if (step === 1) onClose(); else setStep((s) => s - 1); };

  const submit = () => {
    setError("");
    if (!propertyId) { setError(t("request.selectPropertyError")); setStep(3); return; }
    setSubmitting(true);
    try {
      createServiceRequest({
        customer_id: user.id,
        property_id: propertyId,
        tree_count: treeCount,
        preferred_date: date,
        preferred_time: time,
      });
      refresh();
      setSuccess(true);
      setSubmitting(false);
    } catch (e) {
      setError(e.message || "Could not create request");
      setSubmitting(false);
    }
  };

  const fillCurrentLocation = async () => {
    const loc = await locate();
    if (!loc) return;
    setNewProp((p) => ({
      ...p,
      address: loc.address?.line || p.address,
      city: loc.address?.city || p.city,
      state: loc.address?.state || p.state,
      pincode: loc.address?.postcode || p.pincode,
      fullAddress: loc.address?.full || "",
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));
  };

  const addProperty = () => {
    if (!newProp.name || !newProp.address) return;
    const prop = createProperty({
      customer_id: user.id,
      name: newProp.name,
      address: newProp.pincode ? `${newProp.address} - ${newProp.pincode}` : newProp.address,
      city: newProp.city,
      state: newProp.state,
      latitude: newProp.latitude ?? 8.8932,
      longitude: newProp.longitude ?? 76.6141,
      tree_count: newProp.tree_count,
    });
    setPropertyId(prop.id);
    setProperties(getPropertiesByCustomer(user.id));
    setShowAddProperty(false);
  };

  if (!open) return null;

  if (success) {
    return (
      <Modal open={open} onClose={onClose} title={t("request.submitted")}>
        <div className="text-center py-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-coco-ink">{t("request.serviceRequested")}</h3>
          <p className="mt-2 text-sm text-coco-muted">
            {treeCount} {t("request.treesLabel")} · {formatDate(date)} · {formatTime(time)}
          </p>
          <p className="mt-1 text-sm font-semibold text-coco-green">{formatCurrency(price)}</p>
          <Button fullWidth className="mt-6" onClick={onClose}>{t("request.done")}</Button>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={t(STEP_KEYS[step])} className="max-h-[90vh]">
        <button type="button" onClick={back} className="inline-flex items-center gap-1 text-sm font-semibold text-coco-muted mb-3">
          <ChevronLeft size={16} /> {step === 1 ? t("request.close") : t("request.back")}
        </button>

        <div className="flex gap-1.5 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? "bg-coco-green" : "bg-coco-border"}`} />
          ))}
        </div>

        {error && <p className="mb-3 text-sm text-coco-danger font-medium">{error}</p>}

        <div key={step}>

            {step === 1 && (
              <div>
                <p className="text-sm text-coco-muted mb-4">{t("request.whatService")}</p>
                <button type="button" onClick={next} className="w-full text-left">
                  <Card className="ring-2 ring-coco-green border-coco-green">
                    <div className="text-3xl">🌴</div>
                    <h2 className="mt-2 text-lg font-bold text-coco-ink">{t("customer.coconutPlucking")}</h2>
                    <p className="mt-1 text-sm text-coco-muted">{t("request.trainedWorkers")}</p>
                  </Card>
                </button>
                <Button type="button" fullWidth size="lg" className="mt-5" onClick={next}>{t("request.continue")}</Button>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="text-sm text-coco-muted mb-4">{t("request.howManyTrees")}</p>
                <Card>
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setTreeCount((n) => Math.max(1, n - 1))} className="h-12 w-12 rounded-2xl bg-coco-cream flex items-center justify-center text-coco-green active:scale-90 transition-transform">
                      <Minus size={20} />
                    </button>
                    <div className="text-center">
                      <p className="text-4xl font-extrabold text-coco-ink tabular-nums">{treeCount}</p>
                      <p className="text-sm text-coco-muted">{t("request.treesLabel")}</p>
                    </div>
                    <button type="button" onClick={() => setTreeCount((n) => Math.min(50, n + 1))} className="h-12 w-12 rounded-2xl bg-coco-leaf-soft flex items-center justify-center text-coco-green active:scale-90 transition-transform">
                      <Plus size={20} />
                    </button>
                  </div>
                  <p className="mt-4 text-center text-sm text-coco-muted">{t("request.estimated")} · {formatCurrency(price)}</p>
                </Card>
                <Button type="button" fullWidth size="lg" className="mt-5" onClick={next}>{t("request.continue")}</Button>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="text-sm text-coco-muted mb-4">{t("request.selectProperty")}</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {properties.map((p) => <PropertyCard key={p.id} property={p} selected={propertyId === p.id} onSelect={() => setPropertyId(p.id)} />)}
                </div>
                <Button type="button" variant="outline" fullWidth className="mt-3" onClick={() => setShowAddProperty(true)}>
                  <Plus size={16} /> {t("request.addProperty")}
                </Button>
                <Button type="button" fullWidth size="lg" className="mt-4" disabled={!propertyId} onClick={next}>{t("request.continue")}</Button>
              </div>
            )}

            {step === 4 && (
              <div>
                <p className="text-sm text-coco-muted mb-4">{t("request.preferredDateTime")}</p>
                <Card className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-coco-ink mb-2"><Calendar size={15} />{t("request.date")}</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-11 rounded-xl border border-coco-border bg-coco-cream px-3 text-coco-ink" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-coco-ink mb-2"><Clock size={15} />{t("request.timeWindow")}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_WINDOWS.map((t) => (
                        <button key={t} type="button" onClick={() => setTime(t)} className={`h-10 rounded-xl text-xs font-semibold transition-all ${time === t ? "bg-coco-green text-white" : "bg-coco-cream text-coco-ink"}`}>
                          {formatTime(t)}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
                <Button type="button" fullWidth size="lg" className="mt-5" onClick={next}>{t("request.continue")}</Button>
              </div>
            )}

            {step === 5 && (
              <div>
                <p className="text-sm text-coco-muted mb-4">{t("request.reviewRequest")}</p>
                <Card className="space-y-3">
                  <Row label={t("request.service")} value={t("customer.coconutPlucking")} />
                  <Row label={t("customer.trees")} value={`${treeCount} ${t("request.treesLabel")}`} />
                  <Row label={t("request.reviewProperty")} value={selectedProperty ? `${selectedProperty.name} · ${selectedProperty.address}` : "—"} />
                  <Row label={t("request.reviewDate")} value={formatDate(date)} />
                  <Row label={t("request.reviewTime")} value={formatTime(time)} />
                  <div className="border-t border-coco-border pt-3 flex items-center justify-between">
                    <span className="text-sm text-coco-muted">{t("request.estimatedPrice")}</span>
                    <span className="text-xl font-extrabold text-coco-ink">{formatCurrency(price)}</span>
                  </div>
                </Card>
                <Button type="button" fullWidth size="lg" className="mt-5" loading={submitting} onClick={submit}>{t("request.requestPlucking")}</Button>
              </div>
            )}

        </div>
      </Modal>

      <Modal open={showAddProperty} onClose={() => setShowAddProperty(false)} title={t("request.addPropertyTitle")}>
        <div className="space-y-3">
          <Button type="button" variant="soft" fullWidth loading={locating} onClick={fillCurrentLocation}>
            <LocateFixed size={16} /> {locating ? t("request.detecting") : t("request.useLocation")}
          </Button>
          {locationError && <p className="text-xs text-coco-danger font-medium">{locationError}</p>}
          {newProp.fullAddress && (
            <p className="flex items-start gap-1.5 text-xs text-coco-muted bg-coco-leaf-soft rounded-xl px-3 py-2">
              <MapPin size={13} className="mt-0.5 shrink-0 text-coco-green" />
              <span>{newProp.fullAddress}</span>
            </p>
          )}

          {[
            ["name", t("request.propertyName")],
            ["address", t("request.address")],
            ["city", t("request.city")],
            ["state", t("request.state")],
            ["pincode", t("request.pincode")],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm font-semibold text-coco-ink">{label}</label>
              <input value={newProp[key]} onChange={(e) => setNewProp((p) => ({ ...p, [key]: e.target.value }))} className="mt-1.5 w-full h-11 rounded-xl border border-coco-border bg-coco-cream px-3" />
            </div>
          ))}

          {newProp.latitude != null && (
            <p className="text-[11px] text-coco-muted">
              GPS: {newProp.latitude.toFixed(5)}, {newProp.longitude.toFixed(5)}
            </p>
          )}
          <Button type="button" fullWidth className="mt-2" onClick={addProperty}>{t("request.saveProperty")}</Button>
        </div>
      </Modal>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-coco-muted">{label}</span>
      <span className="text-sm font-semibold text-coco-ink text-right">{value}</span>
    </div>
  );
}
