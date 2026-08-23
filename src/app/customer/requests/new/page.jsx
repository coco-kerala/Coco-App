"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Calendar, Clock, LocateFixed, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const TIME_WINDOWS = ["07:00", "08:30", "10:00", "11:30", "14:00", "16:00"];

export default function NewRequestPage() {
  const { user } = useAuth();
  const { version } = useAppData();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [treeCount, setTreeCount] = useState(4);
  const [propertyId, setPropertyId] = useState(null);
  const [date, setDate] = useState("2026-08-23");
  const [time, setTime] = useState("08:30");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
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
  const { locate, locating, error: locationError } = useCurrentLocation();

  const properties = getPropertiesByCustomer(user.id);
  void version;

  useEffect(() => {
    if (!propertyId && properties[0]) setPropertyId(properties[0].id);
  }, [properties, propertyId]);

  const selectedProperty = properties.find((p) => p.id === propertyId);
  const price = calculateServicePrice(treeCount);

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => { if (step === 1) router.push("/customer"); else setStep((s) => s - 1); };

  const submit = () => {
    setError("");
    if (!propertyId) { setError("Please select a property."); setStep(3); return; }
    setSubmitting(true);
    try {
      const req = createServiceRequest({ customer_id: user.id, property_id: propertyId, tree_count: treeCount, preferred_date: date, preferred_time: time });
      router.push(`/customer/requests/${req.id}`);
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
    setShowAddProperty(false);
  };

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="px-5 pt-6 pb-10">
      <button type="button" onClick={back} className="inline-flex items-center gap-1.5 text-sm font-semibold text-coco-muted">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mt-4 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? "bg-coco-green" : "bg-coco-border"}`} />
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-coco-danger font-medium">{error}</p>}

      <AnimatePresence mode="wait">
        <motion.div key={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>

          {step === 1 && (
            <div className="mt-8">
              <h1 className="text-2xl font-extrabold text-coco-ink">What service do you need?</h1>
              <button type="button" onClick={next} className="mt-6 w-full text-left">
                <Card className="ring-2 ring-coco-green border-coco-green">
                  <div className="text-3xl">🌴</div>
                  <h2 className="mt-3 text-xl font-bold text-coco-ink">Coconut Plucking</h2>
                  <p className="mt-1 text-sm text-coco-muted">Trained workers harvest your trees safely.</p>
                </Card>
              </button>
              <Button type="button" fullWidth size="lg" className="mt-8" onClick={next}>Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-8">
              <h1 className="text-2xl font-extrabold text-coco-ink">How many coconut trees?</h1>
              <Card className="mt-8">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setTreeCount((n) => Math.max(1, n - 1))} className="h-14 w-14 rounded-2xl bg-coco-cream flex items-center justify-center text-coco-green active:scale-90 transition-transform">
                    <Minus size={22} />
                  </button>
                  <div className="text-center">
                    <motion.p key={treeCount} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-extrabold text-coco-ink tabular-nums">
                      {treeCount}
                    </motion.p>
                    <p className="text-sm text-coco-muted mt-1">trees</p>
                  </div>
                  <button type="button" onClick={() => setTreeCount((n) => Math.min(50, n + 1))} className="h-14 w-14 rounded-2xl bg-coco-leaf-soft flex items-center justify-center text-coco-green active:scale-90 transition-transform">
                    <Plus size={22} />
                  </button>
                </div>
                <p className="mt-6 text-center text-sm text-coco-muted">Estimated · {formatCurrency(price)}</p>
              </Card>
              <Button type="button" fullWidth size="lg" className="mt-8" onClick={next}>Continue</Button>
            </div>
          )}

          {step === 3 && (
            <div className="mt-8">
              <h1 className="text-2xl font-extrabold text-coco-ink">Select property</h1>
              <div className="mt-6 space-y-3">
                {properties.map((p) => <PropertyCard key={p.id} property={p} selected={propertyId === p.id} onSelect={() => setPropertyId(p.id)} />)}
              </div>
              <Button type="button" variant="outline" fullWidth className="mt-4" onClick={() => setShowAddProperty(true)}>
                <Plus size={16} /> Add Property
              </Button>
              <Button type="button" fullWidth size="lg" className="mt-6" disabled={!propertyId} onClick={next}>Continue</Button>
            </div>
          )}

          {step === 4 && (
            <div className="mt-8">
              <h1 className="text-2xl font-extrabold text-coco-ink">Preferred date & time</h1>
              <Card className="mt-6 space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-coco-ink mb-2"><Calendar size={15} />Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-12 rounded-2xl border border-coco-border bg-coco-cream px-4 text-coco-ink" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-coco-ink mb-2"><Clock size={15} />Time window</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_WINDOWS.map((t) => (
                      <button key={t} type="button" onClick={() => setTime(t)} className={`h-11 rounded-xl text-sm font-semibold transition-all duration-150 ${time === t ? "bg-coco-green text-white shadow-sm scale-[1.02]" : "bg-coco-cream text-coco-ink hover:bg-coco-cream-dark"}`}>
                        {formatTime(t)}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
              <Button type="button" fullWidth size="lg" className="mt-8" onClick={next}>Continue</Button>
            </div>
          )}

          {step === 5 && (
            <div className="mt-8">
              <h1 className="text-2xl font-extrabold text-coco-ink">Review request</h1>
              <Card className="mt-6 space-y-4">
                <Row label="Service" value="Coconut Plucking" />
                <Row label="Trees" value={`${treeCount} trees`} />
                <Row label="Property" value={selectedProperty ? `${selectedProperty.name} · ${selectedProperty.address}` : "—"} />
                <Row label="Date" value={formatDate(date)} />
                <Row label="Time" value={formatTime(time)} />
                <div className="border-t border-coco-border pt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-coco-muted">Estimated price</span>
                  <span className="text-2xl font-extrabold text-coco-ink">{formatCurrency(price)}</span>
                </div>
              </Card>
              <Button type="button" fullWidth size="lg" className="mt-8" loading={submitting} onClick={submit}>Request Plucking</Button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <Modal open={showAddProperty} onClose={() => setShowAddProperty(false)} title="Add Property">
        <div className="space-y-3">
          <Button type="button" variant="soft" fullWidth loading={locating} onClick={fillCurrentLocation}>
            <LocateFixed size={16} /> {locating ? "Detecting location…" : "Use my current location"}
          </Button>
          {locationError && <p className="text-xs text-coco-danger font-medium">{locationError}</p>}
          {newProp.fullAddress && (
            <p className="flex items-start gap-1.5 text-xs text-coco-muted bg-coco-leaf-soft rounded-xl px-3 py-2">
              <MapPin size={13} className="mt-0.5 shrink-0 text-coco-green" />
              <span>{newProp.fullAddress}</span>
            </p>
          )}

          {[["name", "Property name"], ["address", "Address / locality"], ["city", "City"], ["state", "State"], ["pincode", "PIN code"]].map(([key, label]) => (
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
          <Button type="button" fullWidth className="mt-2" onClick={addProperty}>Save property</Button>
        </div>
      </Modal>
    </div>
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
