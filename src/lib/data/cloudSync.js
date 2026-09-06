"use client";

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

const LIVE_FLAG = "kerago_live_mode";

/** Live mode when Supabase env is set (and not forced demo). */
export function isLiveMode() {
  if (typeof window !== "undefined") {
    try {
      if (localStorage.getItem("kerago_force_demo") === "1") return false;
    } catch {}
  }
  return isSupabaseConfigured();
}

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone_display || row.phone,
    email: row.email,
    role: row.role,
    profile_image: row.profile_image,
    rating: row.rating != null ? Number(row.rating) : undefined,
    bank: row.bank || {},
    upi: row.upi || row.bank?.upi || "",
    gpay_image: row.gpay_image || null,
    created_at: row.created_at,
  };
}

function userRow(u) {
  return {
    id: u.id,
    name: u.name,
    phone: String(u.phone || "").replace(/\D/g, "").slice(-12) || u.phone,
    phone_display: u.phone,
    email: u.email || null,
    role: u.role,
    profile_image: u.profile_image || null,
    rating: u.rating ?? null,
    bank: u.bank || {},
    upi: u.upi || u.bank?.upi || null,
    gpay_image: u.gpay_image || null,
    updated_at: new Date().toISOString(),
  };
}

/** Pull all app data from Supabase into local store shape. */
export async function pullCloudData() {
  const sb = getSupabaseClient();
  if (!sb) return null;

  const [
    usersRes,
    propsRes,
    reqRes,
    jobsRes,
    photosRes,
    payRes,
    revRes,
  ] = await Promise.all([
    sb.from("app_users").select("*"),
    sb.from("properties").select("*"),
    sb.from("service_requests").select("*"),
    sb.from("jobs").select("*"),
    sb.from("job_photos").select("*"),
    sb.from("payments").select("*"),
    sb.from("reviews").select("*"),
  ]);

  if (usersRes.error) {
    console.warn("[kerago] pull users:", usersRes.error.message);
    return null;
  }

  return {
    users: (usersRes.data || []).map(mapUser),
    properties: propsRes.data || [],
    requests: (reqRes.data || []).map((r) => ({
      ...r,
      estimated_price: Number(r.estimated_price),
      final_price: r.final_price != null ? Number(r.final_price) : null,
    })),
    jobs: jobsRes.data || [],
    photos: (photosRes.data || []).map((p) => ({
      id: p.id,
      job_id: p.job_id,
      photo_url: p.photo_url,
      created_at: p.created_at,
    })),
    payments: (payRes.data || []).map((p) => ({
      ...p,
      amount: Number(p.amount),
    })),
    reviews: revRes.data || [],
    workerLocations: {},
    otpSessions: [],
  };
}

/** Push full local snapshot to Supabase (upsert). */
export async function pushCloudData(data) {
  const sb = getSupabaseClient();
  if (!sb || !data) return { ok: false };

  try {
    if (data.users?.length) {
      const { error } = await sb.from("app_users").upsert(data.users.map(userRow), { onConflict: "id" });
      if (error) console.warn("[kerago] push users:", error.message);
    }
    if (data.properties?.length) {
      const rows = data.properties.map((p) => ({
        id: p.id,
        customer_id: p.customer_id,
        name: p.name,
        address: p.address,
        city: p.city || null,
        state: p.state || null,
        pincode: p.pincode || null,
        latitude: p.latitude ?? 0,
        longitude: p.longitude ?? 0,
        tree_count: p.tree_count ?? 0,
        last_service_date: p.last_service_date || null,
        created_at: p.created_at || new Date().toISOString(),
      }));
      const { error } = await sb.from("properties").upsert(rows, { onConflict: "id" });
      if (error) console.warn("[kerago] push properties:", error.message);
    }
    if (data.requests?.length) {
      const rows = data.requests.map((r) => ({
        id: r.id,
        customer_id: r.customer_id,
        property_id: r.property_id,
        service_type: r.service_type || "coconut_plucking",
        tree_count: r.tree_count,
        preferred_date: r.preferred_date || null,
        preferred_time: r.preferred_time || null,
        status: r.status,
        assigned_worker_id: r.assigned_worker_id || null,
        estimated_price: r.estimated_price,
        final_price: r.final_price,
        notes: r.notes,
        trees_completed: r.trees_completed,
        created_at: r.created_at,
        updated_at: r.updated_at || new Date().toISOString(),
      }));
      const { error } = await sb.from("service_requests").upsert(rows, { onConflict: "id" });
      if (error) console.warn("[kerago] push requests:", error.message);
    }
    if (data.jobs?.length) {
      const { error } = await sb.from("jobs").upsert(data.jobs, { onConflict: "id" });
      if (error) console.warn("[kerago] push jobs:", error.message);
    }
    if (data.photos?.length) {
      const rows = data.photos.map((p) => ({
        id: p.id,
        job_id: p.job_id,
        photo_url: p.photo_url,
        created_at: p.created_at,
      }));
      const { error } = await sb.from("job_photos").upsert(rows, { onConflict: "id" });
      if (error) console.warn("[kerago] push photos:", error.message);
    }
    if (data.payments?.length) {
      const { error } = await sb.from("payments").upsert(data.payments, { onConflict: "id" });
      if (error) console.warn("[kerago] push payments:", error.message);
    }
    if (data.reviews?.length) {
      const { error } = await sb.from("reviews").upsert(data.reviews, { onConflict: "id" });
      if (error) console.warn("[kerago] push reviews:", error.message);
    }

    try {
      localStorage.setItem(LIVE_FLAG, "1");
    } catch {}
    return { ok: true };
  } catch (e) {
    console.warn("[kerago] pushCloudData failed", e);
    return { ok: false };
  }
}

let pushTimer = null;
export function scheduleCloudPush(data) {
  if (!isLiveMode()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushCloudData(data);
  }, 400);
}
