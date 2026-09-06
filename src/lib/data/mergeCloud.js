"use client";

/**
 * Soft-merge cloud data so a live office session is not wiped on pull.
 */
export function mergeCloudIntoLocal(local, cloud) {
  if (!cloud) return local;

  const byId = (arr) => {
    const m = new Map();
    (arr || []).forEach((x) => {
      if (x?.id) m.set(x.id, x);
    });
    return m;
  };

  const mergeArr = (a, b) => {
    const m = byId(a);
    (b || []).forEach((x) => {
      if (x?.id) m.set(x.id, { ...(m.get(x.id) || {}), ...x });
    });
    return [...m.values()];
  };

  return {
    users: mergeArr(local.users, cloud.users),
    properties: mergeArr(local.properties, cloud.properties),
    requests: mergeArr(local.requests, cloud.requests),
    jobs: mergeArr(local.jobs, cloud.jobs),
    photos: mergeArr(local.photos, cloud.photos),
    payments: mergeArr(local.payments, cloud.payments),
    reviews: mergeArr(local.reviews, cloud.reviews),
    workerLocations: { ...(local.workerLocations || {}), ...(cloud.workerLocations || {}) },
    otpSessions: local.otpSessions || [],
  };
}
