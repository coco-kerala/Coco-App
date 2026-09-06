"use client";

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { normalizePhone, generateOtpCode, formatPhoneDisplay } from "@/lib/auth/otp";
import {
  createOtpSession as localCreate,
  getOtpSessions as localList,
  markOtpWhatsAppSent as localMarkSent,
  verifyOtpSession as localVerify,
  findOrCreateUserByPhone as localFindOrCreate,
} from "@/lib/data/store";

const OTP_TTL_MS = 10 * 60 * 1000;

function defaultName(role) {
  if (role === "admin") return "KeraGo";
  if (role === "worker") return "Partner";
  return "Home";
}

function mapSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    phone: row.phone,
    phone_display: row.phone_display || formatPhoneDisplay(row.phone),
    role: row.role,
    user_id: row.user_id,
    user_name: row.user_name,
    otp_code: row.otp_code,
    status: row.status,
    whatsapp_sent_at: row.whatsapp_sent_at,
    verified_at: row.verified_at,
    created_at: row.created_at,
    expires_at: row.expires_at,
  };
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone_display || formatPhoneDisplay(row.phone),
    email: row.email,
    role: row.role,
    profile_image: row.profile_image,
    rating: row.rating != null ? Number(row.rating) : undefined,
    created_at: row.created_at,
  };
}

async function findOrCreateAppUser(supabase, phone, role) {
  // Prefer app_users; if table missing, return a virtual user (OTP still works)
  try {
    const { data: existing, error: findErr } = await supabase
      .from("app_users")
      .select("*")
      .eq("phone", phone)
      .eq("role", role)
      .maybeSingle();

    if (!findErr && existing) return existing;

    if (!findErr) {
      const { generateId } = await import("@/lib/utils");
      const id = generateId();
      const { data: created, error: createErr } = await supabase
        .from("app_users")
        .insert({
          id,
          name: defaultName(role),
          phone,
          phone_display: formatPhoneDisplay(phone),
          role,
          rating: role === "worker" ? 5 : null,
        })
        .select("*")
        .single();
      if (!createErr && created) return created;
    }
  } catch {}

  return {
    id: null,
    name: defaultName(role),
    phone,
    phone_display: formatPhoneDisplay(phone),
    role,
  };
}

function isMissingTable(err) {
  const msg = String(err?.message || err || "");
  return msg.includes("PGRST205") || msg.includes("schema cache") || msg.includes("Could not find");
}

function isRlsBlocked(err) {
  const msg = String(err?.message || err || "");
  return msg.includes("row-level security") || msg.includes("42501");
}

/** Create OTP in Supabase so admin can see & WhatsApp it. */
export async function requestOtpBackend({ phone, role }) {
  const normalized = normalizePhone(phone);
  if (normalized.length < 10) throw new Error("Invalid phone number");

  if (!isSupabaseConfigured()) {
    return localCreate({ phone: normalized, role });
  }

  const supabase = getSupabaseClient();
  try {
    const user = await findOrCreateAppUser(supabase, normalized, role);
    const otp = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

    await supabase
      .from("otp_sessions")
      .update({ status: "expired" })
      .eq("phone", normalized)
      .eq("role", role)
      .in("status", ["pending", "sent"]);

    const payload = {
      phone: normalized,
      phone_display: formatPhoneDisplay(normalized),
      role,
      user_id: user.id || null,
      user_name: user.name,
      otp_code: otp,
      status: "pending",
      expires_at: expiresAt,
    };

    const { data, error } = await supabase
      .from("otp_sessions")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      // Older DBs without phone_display — retry without it
      if (String(error.message || "").includes("phone_display")) {
        const { phone_display: _pd, ...withoutDisplay } = payload;
        const retry = await supabase
          .from("otp_sessions")
          .insert(withoutDisplay)
          .select("*")
          .single();
        if (retry.error) throw retry.error;
        return mapSession({
          ...retry.data,
          phone_display: formatPhoneDisplay(normalized),
        });
      }
      throw error;
    }

    // Alert office that someone needs an OTP on WhatsApp
    try {
      const { data: admins } = await supabase.from("app_users").select("id, role").eq("role", "admin");
      const { notifyUser } = await import("@/lib/notifications/notify");
      await Promise.all(
        (admins || [])
          .filter((a) => a?.id && !String(a.id).startsWith("usr_"))
          .map((a) =>
            notifyUser({
              userId: a.id,
              title: "New OTP request",
              body: `${defaultName(role)} · ${formatPhoneDisplay(normalized)} — send WhatsApp code`,
              href: "/admin/otp",
              type: "otp",
            })
          )
      );
    } catch {}

    return mapSession({ ...data, phone_display: formatPhoneDisplay(normalized) });
  } catch (err) {
    if (isRlsBlocked(err)) {
      throw new Error(
        "Supabase blocked OTP save (RLS). Run supabase/fix_otp_rls.sql in the SQL Editor, then try again."
      );
    }
    // Live mode: never hide OTP on this phone only — office must see it in Supabase.
    console.error("[OTP] Supabase save failed:", err?.message || err);
    throw new Error(err?.message || "Could not save OTP to Supabase. Try again.");
  }
}

export async function listOtpBackend({ status } = {}) {
  if (!isSupabaseConfigured()) {
    const list = localList();
    if (status === "active") return list.filter((s) => s.status === "pending" || s.status === "sent");
    if (status) return list.filter((s) => s.status === status);
    return list;
  }

  const supabase = getSupabaseClient();
  try {
    const nowIso = new Date().toISOString();
    await supabase
      .from("otp_sessions")
      .update({ status: "expired" })
      .in("status", ["pending", "sent"])
      .lt("expires_at", nowIso);

    let query = supabase
      .from("otp_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (status === "active") {
      query = query.in("status", ["pending", "sent"]);
    } else if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapSession);
  } catch (err) {
    console.warn("[OTP] list failed, local fallback:", err?.message || err);
    const list = localList();
    if (status === "active") return list.filter((s) => s.status === "pending" || s.status === "sent");
    if (status) return list.filter((s) => s.status === status);
    return list;
  }
}

export async function markOtpSentBackend(otpId) {
  if (!isSupabaseConfigured()) {
    return localMarkSent(otpId);
  }

  const supabase = getSupabaseClient();
  try {
    const { data: current, error: getErr } = await supabase
      .from("otp_sessions")
      .select("*")
      .eq("id", otpId)
      .single();
    if (getErr) throw getErr;

    const nextStatus = current.status === "pending" ? "sent" : current.status;
    const { data, error } = await supabase
      .from("otp_sessions")
      .update({
        status: nextStatus,
        whatsapp_sent_at: new Date().toISOString(),
      })
      .eq("id", otpId)
      .select("*")
      .single();
    if (error) throw error;
    return mapSession(data);
  } catch (err) {
    console.warn("[OTP] mark sent failed, local fallback:", err?.message || err);
    return localMarkSent(otpId);
  }
}

export async function verifyOtpBackend({ phone, role, code }) {
  const normalized = normalizePhone(phone);
  const otp = String(code).trim();

  if (!isSupabaseConfigured()) {
    return localVerify({ phone: normalized, role, code: otp });
  }

  const supabase = getSupabaseClient();
  try {
    const { data: session, error } = await supabase
      .from("otp_sessions")
      .select("*")
      .eq("phone", normalized)
      .eq("role", role)
      .eq("otp_code", otp)
      .in("status", ["pending", "sent"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!session) return { ok: false, error: "Invalid or expired OTP" };

    if (new Date(session.expires_at).getTime() < Date.now()) {
      await supabase.from("otp_sessions").update({ status: "expired" }).eq("id", session.id);
      return { ok: false, error: "OTP expired. Request a new one." };
    }

    await supabase
      .from("otp_sessions")
      .update({ status: "verified", verified_at: new Date().toISOString() })
      .eq("id", session.id);

    let user = null;
    const appUser = await findOrCreateAppUser(supabase, normalized, role);
    if (appUser?.id) user = mapUser(appUser);

    // Keep local cache in sync with the same id as Supabase
    try {
      const { getAppData, replaceAppData, findOrCreateUserByPhone, updateUserProfile } = await import(
        "@/lib/data/store"
      );
      if (user?.id) {
        const data = getAppData();
        const idx = data.users.findIndex((u) => u.id === user.id || (u.phone && u.role === role));
        if (idx >= 0) {
          data.users[idx] = { ...data.users[idx], ...user };
        } else {
          data.users.push(user);
        }
        replaceAppData(data);
      } else {
        const localUser = findOrCreateUserByPhone(normalized, role);
        if (session.user_name && session.user_name !== defaultName(role)) {
          updateUserProfile(localUser.id, { name: session.user_name });
        }
        user = {
          ...localUser,
          name: session.user_name || localUser.name,
        };
      }
    } catch {
      user = user || {
        id: appUser?.id || `tmp_${normalized}`,
        name: session.user_name || defaultName(role),
        phone: formatPhoneDisplay(normalized),
        role,
      };
    }

    return { ok: true, user, session: mapSession(session) };
  } catch (err) {
    if (isRlsBlocked(err)) {
      return {
        ok: false,
        error: "Supabase RLS blocked OTP. Run supabase/fix_otp_rls.sql in SQL Editor.",
      };
    }
    console.warn("[OTP] verify failed, local fallback:", err?.message || err);
    return localVerify({ phone: normalized, role, code: otp });
  }
}

export function supabaseOtpReady() {
  return isSupabaseConfigured();
}
