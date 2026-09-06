"use client";

import { generateId } from "../utils";
import { calculateServicePrice } from "../pricing";
import { normalizePhone, generateOtpCode } from "@/lib/auth/otp";
import { scheduleCloudPush } from "@/lib/data/cloudSync";
import { notifyUser, notifyAdmins } from "@/lib/notifications/notify";

const STORAGE_KEY = "kerago_app_data_v1";

function getEmptyData() {
  return {
    users: [],
    properties: [],
    requests: [],
    jobs: [],
    photos: [],
    payments: [],
    reviews: [],
    workerLocations: {},
    otpSessions: [],
  };
}

function getDefaultData() {
  return getEmptyData();
}

function normalize(data) {
  if (!data.users) data.users = [];
  if (!data.jobs) data.jobs = [];
  if (!data.requests) data.requests = [];
  if (!data.properties) data.properties = [];
  if (!data.photos) data.photos = [];
  if (!data.payments) data.payments = [];
  if (!data.reviews) data.reviews = [];
  if (!data.workerLocations) data.workerLocations = {};
  if (!Array.isArray(data.otpSessions)) data.otpSessions = [];
  return data;
}

function loadData() {
  if (typeof window === "undefined") return getDefaultData();
  try {
    // Migrate away from old demo storage key
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("coco_demo_data_v2");
    if (!raw) {
      const fresh = getDefaultData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = normalize(JSON.parse(raw));
    // Drop leftover sample seed users from old demos
    parsed.users = (parsed.users || []).filter((u) => !String(u.id).startsWith("usr_"));
    parsed.requests = (parsed.requests || []).filter((r) => !String(r.id).startsWith("req_"));
    parsed.jobs = (parsed.jobs || []).filter((j) => !String(j.id).startsWith("job_"));
    parsed.properties = (parsed.properties || []).filter((p) => !String(p.id).startsWith("prop_"));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    try {
      localStorage.removeItem("coco_demo_data_v2");
    } catch {}
    return parsed;
  } catch {
    const fresh = getDefaultData();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
    return fresh;
  }
}

function saveData(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("coco-data-change"));
  scheduleCloudPush(data);
}

export function ensureAppData() {
  if (typeof window === "undefined") return getDefaultData();
  return loadData();
}

/** @deprecated use ensureAppData */
export function ensureDemoData() {
  return ensureAppData();
}

/** Replace local cache with cloud data (call once on app boot in live mode). */
export function replaceAppData(data) {
  const next = normalize({
    ...getEmptyData(),
    ...data,
    otpSessions: loadData().otpSessions || [],
  });
  saveData(next);
  return next;
}

export function getAppData() {
  return loadData();
}

export function resetAppData() {
  const data = getDefaultData();
  saveData(data);
  return data;
}

export function subscribeToData(callback) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("coco-data-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("coco-data-change", handler);
    window.removeEventListener("storage", handler);
  };
}

export function getUserById(id) {
  return loadData().users.find((u) => u.id === id);
}

export function updateUserProfile(userId, updates) {
  const data = loadData();
  const user = data.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  Object.assign(user, updates);
  saveData(data);
  return user;
}

export function updateProperty(propertyId, updates) {
  const data = loadData();
  const property = data.properties.find((p) => p.id === propertyId);
  if (!property) throw new Error("Property not found");
  Object.assign(property, updates);
  saveData(data);
  return property;
}

export function getPropertiesByCustomer(customerId) {
  return loadData().properties.filter((p) => p.customer_id === customerId);
}

export function getPropertyById(id) {
  return loadData().properties.find((p) => p.id === id);
}

function enrichRequest(request, data) {
  const job = data.jobs.find((j) => j.request_id === request.id);
  return {
    ...request,
    property: data.properties.find((p) => p.id === request.property_id),
    customer: data.users.find((u) => u.id === request.customer_id),
    worker: request.assigned_worker_id
      ? data.users.find((u) => u.id === request.assigned_worker_id)
      : undefined,
    job,
    photos: job ? data.photos.filter((p) => p.job_id === job.id) : [],
    payment: data.payments.find((p) => p.request_id === request.id),
    review: data.reviews.find((r) => r.request_id === request.id),
  };
}

export function getRequestById(id) {
  if (!id) return undefined;
  const data = loadData();
  const request = data.requests.find((r) => r.id === id);
  if (!request) return undefined;
  return enrichRequest(request, data);
}

export function getRequestsByCustomer(customerId) {
  const data = loadData();
  return data.requests
    .filter((r) => r.customer_id === customerId)
    .map((r) => enrichRequest(r, data))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getActiveRequest(customerId) {
  const activeStatuses = ["new", "unassigned", "assigned", "on_the_way", "arrived", "in_progress", "completed"];
  return getRequestsByCustomer(customerId).find((r) => activeStatuses.includes(r.status));
}

export function getAllRequests() {
  const data = loadData();
  return data.requests
    .map((r) => enrichRequest(r, data))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getJobsByWorker(workerId) {
  const data = loadData();
  return data.jobs
    .filter((j) => j.worker_id === workerId)
    .map((j) => {
      const request = data.requests.find((r) => r.id === j.request_id);
      if (!request) return null;
      return { ...j, request: enrichRequest(request, data) };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getJobById(id) {
  if (!id) return undefined;
  const data = loadData();
  const job = data.jobs.find((j) => j.id === id);
  if (!job) return undefined;
  const request = data.requests.find((r) => r.id === job.request_id);
  if (!request) return undefined;
  return { ...job, request: enrichRequest(request, data), photos: data.photos.filter((p) => p.job_id === job.id) };
}

export function getJobByRequestId(requestId) {
  const data = loadData();
  const job = data.jobs.find((j) => j.request_id === requestId);
  if (!job) return undefined;
  return getJobById(job.id);
}

export function createProperty(input) {
  const data = loadData();
  const property = { ...input, id: generateId("prop"), last_service_date: null, created_at: new Date().toISOString() };
  data.properties.push(property);
  saveData(data);
  return property;
}

export function createServiceRequest(input) {
  const data = loadData();
  const now = new Date().toISOString();
  const request = {
    id: generateId("req"),
    customer_id: input.customer_id,
    property_id: input.property_id,
    service_type: "coconut_plucking",
    tree_count: input.tree_count,
    preferred_date: input.preferred_date,
    preferred_time: input.preferred_time,
    status: "unassigned",
    assigned_worker_id: null,
    estimated_price: calculateServicePrice(input.tree_count),
    final_price: null,
    notes: input.notes || null,
    trees_completed: null,
    created_at: now,
    updated_at: now,
  };
  data.requests.push(request);
  data.payments.push({
    id: generateId("pay"),
    request_id: request.id,
    amount: request.estimated_price,
    status: "pending",
    payment_method: null,
    paid_at: null,
    created_at: now,
  });
  saveData(data);

  notifyAdmins(
    {
      title: "New booking",
      body: "Someone booked coconut care. Open Office to assign a partner.",
      href: "/admin/requests",
      type: "request",
    },
    data.users
  );
  notifyUser({
    userId: request.customer_id,
    title: "Booking received",
    body: "We got your request. Office will assign a partner soon.",
    href: `/user/requests/${request.id}`,
    type: "request",
  });

  return enrichRequest(request, data);
}

export function assignWorker(requestId, workerId) {
  const data = loadData();
  const request = data.requests.find((r) => r.id === requestId);
  if (!request) throw new Error("Request not found");

  const now = new Date().toISOString();
  request.assigned_worker_id = workerId;
  request.status = "assigned";
  request.updated_at = now;

  let job = data.jobs.find((j) => j.request_id === requestId);
  if (job) {
    job.worker_id = workerId;
    job.status = "assigned";
    job.updated_at = now;
  } else {
    job = { id: generateId("job"), request_id: requestId, worker_id: workerId, status: "assigned", started_at: null, completed_at: null, completion_notes: null, trees_completed: null, created_at: now, updated_at: now };
    data.jobs.push(job);
  }

  if (data.workerLocations[workerId]) {
    data.workerLocations[workerId].status = "assigned";
    data.workerLocations[workerId].jobsToday += 1;
  }

  saveData(data);

  notifyUser({
    userId: workerId,
    title: "New job for you",
    body: "Office assigned you a coconut care job. Open it now.",
    href: "/partner",
    type: "job",
  });
  notifyUser({
    userId: request.customer_id,
    title: "Partner assigned",
    body: "A partner is coming for your booking.",
    href: `/user/requests/${requestId}`,
    type: "job",
  });

  return enrichRequest(request, data);
}

export function updateJobStatus(jobId, status, extras = {}) {
  const data = loadData();
  const job = data.jobs.find((j) => j.id === jobId);
  if (!job) throw new Error("Job not found");

  const request = data.requests.find((r) => r.id === job.request_id);
  if (!request) throw new Error("Request not found");

  const now = new Date().toISOString();
  job.status = status;
  job.updated_at = now;

  const statusMap = { assigned: "assigned", on_the_way: "on_the_way", arrived: "arrived", in_progress: "in_progress", completed: "completed" };
  request.status = statusMap[status];
  request.updated_at = now;

  if (status === "in_progress" && !job.started_at) job.started_at = now;

  if (status === "completed") {
    job.completed_at = now;
    job.trees_completed = extras.trees_completed ?? request.tree_count;
    job.completion_notes = extras.completion_notes ?? null;
    request.trees_completed = job.trees_completed;
    request.final_price = request.estimated_price;

    const property = data.properties.find((p) => p.id === request.property_id);
    if (property) property.last_service_date = now.slice(0, 10);

    if (extras.photo_urls) {
      for (const url of extras.photo_urls) {
        data.photos.push({ id: generateId("photo"), job_id: job.id, photo_url: url, created_at: now });
      }
    }
    if (data.workerLocations[job.worker_id]) data.workerLocations[job.worker_id].status = "available";
  } else if (data.workerLocations[job.worker_id]) {
    const locStatus = status === "on_the_way" ? "on_the_way" : (status === "arrived" || status === "in_progress") ? "working" : "assigned";
    data.workerLocations[job.worker_id].status = locStatus;
  }

  saveData(data);

  const statusLabel = {
    on_the_way: "Partner is on the way",
    arrived: "Partner has arrived",
    in_progress: "Work started",
    completed: "Work finished — please pay",
    assigned: "Job assigned",
  };
  if (statusLabel[status]) {
    notifyUser({
      userId: request.customer_id,
      title: statusLabel[status],
      body: status === "completed"
        ? "Open the booking to see GPay / bank and pay."
        : "Open your booking for details.",
      href: `/user/requests/${request.id}`,
      type: "status",
    });
    notifyAdmins(
      {
        title: `Job update: ${status.replace(/_/g, " ")}`,
        body: `Request ${request.id}`,
        href: "/admin/jobs",
        type: "status",
      },
      data.users
    );
  }

  return getJobById(jobId);
}

export function confirmAndRate(input) {
  const data = loadData();
  const request = data.requests.find((r) => r.id === input.request_id);
  if (!request) throw new Error("Request not found");

  const now = new Date().toISOString();
  request.status = "confirmed";
  request.updated_at = now;

  const payment = data.payments.find((p) => p.request_id === input.request_id);
  if (payment) {
    payment.status = "paid";
    payment.payment_method = "UPI";
    payment.paid_at = now;
    payment.amount = request.final_price ?? request.estimated_price;
  }

  data.reviews.push({
    id: generateId("rev"),
    request_id: input.request_id,
    customer_id: input.customer_id,
    worker_id: request.assigned_worker_id,
    rating: input.rating,
    comment: input.comment || null,
    created_at: now,
  });

  saveData(data);

  if (request.assigned_worker_id) {
    notifyUser({
      userId: request.assigned_worker_id,
      title: "Payment confirmed",
      body: `Customer rated ${input.rating}★. Good work!`,
      href: "/partner",
      type: "payment",
    });
  }
  notifyAdmins(
    {
      title: "Booking confirmed & paid",
      body: `Rating ${input.rating}★`,
      href: "/admin/payments",
      type: "payment",
    },
    data.users
  );

  return enrichRequest(request, data);
}

export function cancelRequest(requestId) {
  const data = loadData();
  const request = data.requests.find((r) => r.id === requestId);
  if (!request) throw new Error("Request not found");
  request.status = "cancelled";
  request.updated_at = new Date().toISOString();
  saveData(data);

  notifyAdmins(
    { title: "Booking cancelled", body: requestId, href: "/admin/requests", type: "request" },
    data.users
  );
  if (request.assigned_worker_id) {
    notifyUser({
      userId: request.assigned_worker_id,
      title: "Job cancelled",
      body: "A booking assigned to you was cancelled.",
      href: "/partner",
      type: "job",
    });
  }

  return enrichRequest(request, data);
}

export function updateRequestPrice(requestId, price) {
  const data = loadData();
  const request = data.requests.find((r) => r.id === requestId);
  if (!request) throw new Error("Request not found");
  request.estimated_price = price;
  request.updated_at = new Date().toISOString();
  const payment = data.payments.find((p) => p.request_id === requestId);
  if (payment && payment.status === "pending") payment.amount = price;
  saveData(data);
  return enrichRequest(request, data);
}

export function rescheduleRequest(requestId, date, time) {
  const data = loadData();
  const request = data.requests.find((r) => r.id === requestId);
  if (!request) throw new Error("Request not found");
  request.preferred_date = date;
  request.preferred_time = time;
  request.updated_at = new Date().toISOString();
  saveData(data);
  return enrichRequest(request, data);
}

export function getWorkers() {
  const data = loadData();
  return data.users
    .filter((u) => u.role === "worker")
    .map((w) => ({
      ...w,
      location: data.workerLocations[w.id],
      jobsToday: data.jobs.filter(
        (j) => j.worker_id === w.id && j.status !== "completed" && data.requests.find((r) => r.id === j.request_id)?.preferred_date === new Date().toISOString().slice(0, 10)
      ).length,
      earnings: data.jobs
        .filter((j) => j.worker_id === w.id && j.status === "completed")
        .reduce((sum, j) => { const req = data.requests.find((r) => r.id === j.request_id); return sum + (req?.final_price ?? req?.estimated_price ?? 0); }, 0),
    }));
}

export function getAvailableWorkersForRequest(requestId) {
  const data = loadData();
  const request = data.requests.find((r) => r.id === requestId);
  if (!request) return [];
  const property = data.properties.find((p) => p.id === request.property_id);
  if (!property) return [];

  return getWorkers()
    .map((w) => {
      const loc = data.workerLocations[w.id];
      const distance = loc
        ? Math.sqrt((loc.latitude - property.latitude) ** 2 + (loc.longitude - property.longitude) ** 2) * 111
        : 99;
      return { ...w, distance: Math.round(distance * 10) / 10, availability: loc?.status ?? "offline" };
    })
    .sort((a, b) => {
      const availOrder = (s) => (s === "available" ? 0 : s === "assigned" ? 1 : 2);
      if (availOrder(a.availability) !== availOrder(b.availability)) return availOrder(a.availability) - availOrder(b.availability);
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.jobsToday - b.jobsToday;
    });
}

export function getAdminMetrics() {
  const data = loadData();
  const today = new Date().toISOString().slice(0, 10);
  const requests = data.requests;
  return {
    newRequests: requests.filter((r) => r.status === "new").length,
    unassigned: requests.filter((r) => r.status === "unassigned").length,
    assigned: requests.filter((r) => r.status === "assigned").length,
    inProgress: requests.filter((r) => ["on_the_way", "arrived", "in_progress"].includes(r.status)).length,
    completedToday: requests.filter((r) => (r.status === "completed" || r.status === "confirmed") && r.updated_at.startsWith(today)).length,
    availableWorkers: Object.values(data.workerLocations).filter((w) => w.status === "available").length,
    todaysRevenue: data.payments.filter((p) => p.status === "paid" && p.paid_at?.startsWith(today)).reduce((sum, p) => sum + p.amount, 0),
  };
}

export function getCustomers() {
  return loadData().users.filter((u) => u.role === "customer");
}

export function getAllProperties() {
  return loadData().properties;
}

export function getAllPayments() {
  const data = loadData();
  return data.payments.map((p) => ({ ...p, request: data.requests.find((r) => r.id === p.request_id) }));
}

/* ─── Phone / OTP helpers (local backend until Supabase is connected) ─── */

export function findUserByPhone(phone, role) {
  const normalized = normalizePhone(phone);
  return loadData().users.find(
    (u) => normalizePhone(u.phone) === normalized && (!role || u.role === role)
  );
}

export function findOrCreateUserByPhone(phone, role) {
  const normalized = normalizePhone(phone);
  const existing = findUserByPhone(normalized, role);
  if (existing) return existing;

  const data = loadData();
  const user = {
    id: generateId(`usr_${role}`),
    name: role === "admin" ? "Office" : role === "worker" ? "Partner" : "Home",
    phone: formatStoredPhone(normalized),
    email: null,
    role,
    profile_image: null,
    rating: role === "worker" ? 5 : undefined,
    created_at: new Date().toISOString(),
  };
  data.users.push(user);
  saveData(data);
  return user;
}

function formatStoredPhone(normalized) {
  if (normalized.length === 12 && normalized.startsWith("91")) {
    return `+91 ${normalized.slice(2, 7)} ${normalized.slice(7)}`;
  }
  return `+${normalized}`;
}

const OTP_TTL_MS = 10 * 60 * 1000;

export function createOtpSession({ phone, role }) {
  const normalized = normalizePhone(phone);
  if (normalized.length < 10) throw new Error("Invalid phone number");

  const user = findOrCreateUserByPhone(normalized, role);
  const data = loadData();

  // Expire older pending sessions for same phone+role
  data.otpSessions = (data.otpSessions || []).map((s) => {
    if (s.phone === normalized && s.role === role && s.status === "pending") {
      return { ...s, status: "expired" };
    }
    return s;
  });

  const session = {
    id: generateId("otp"),
    phone: normalized,
    phone_display: formatStoredPhone(normalized),
    role,
    user_id: user.id,
    user_name: user.name,
    otp_code: generateOtpCode(),
    status: "pending", // pending | sent | verified | expired
    whatsapp_sent_at: null,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
  };

  data.otpSessions.unshift(session);
  saveData(data);
  return session;
}

export function getOtpSessions({ status } = {}) {
  const now = Date.now();
  const data = loadData();
  let list = [...(data.otpSessions || [])];

  // Soft-expire
  let changed = false;
  list = list.map((s) => {
    if ((s.status === "pending" || s.status === "sent") && new Date(s.expires_at).getTime() < now) {
      changed = true;
      return { ...s, status: "expired" };
    }
    return s;
  });
  if (changed) {
    data.otpSessions = list;
    saveData(data);
  }

  if (status) list = list.filter((s) => s.status === status);
  return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function markOtpWhatsAppSent(otpId) {
  const data = loadData();
  const session = data.otpSessions.find((s) => s.id === otpId);
  if (!session) throw new Error("OTP not found");
  session.status = session.status === "pending" ? "sent" : session.status;
  session.whatsapp_sent_at = new Date().toISOString();
  saveData(data);
  return session;
}

export function verifyOtpSession({ phone, role, code }) {
  const normalized = normalizePhone(phone);
  const data = loadData();
  const session = (data.otpSessions || []).find(
    (s) =>
      s.phone === normalized &&
      s.role === role &&
      (s.status === "pending" || s.status === "sent") &&
      s.otp_code === String(code).trim()
  );

  if (!session) return { ok: false, error: "Invalid or expired OTP" };
  if (new Date(session.expires_at).getTime() < Date.now()) {
    session.status = "expired";
    saveData(data);
    return { ok: false, error: "OTP expired. Request a new one." };
  }

  session.status = "verified";
  session.verified_at = new Date().toISOString();
  saveData(data);

  const user = data.users.find((u) => u.id === session.user_id) || findUserByPhone(normalized, role);
  return { ok: true, user, session };
}

export function deleteProperty(propertyId) {
  const data = loadData();
  data.properties = data.properties.filter((p) => p.id !== propertyId);
  saveData(data);
}
