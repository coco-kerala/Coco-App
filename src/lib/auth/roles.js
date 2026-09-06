/** URL segment for each internal auth role */
export const ROLE_PATH = {
  customer: "user",
  worker: "partner",
  admin: "admin",
};

export function pathForRole(role) {
  return `/${ROLE_PATH[role] || role}`;
}

export function loginPathForRole(role) {
  return `${pathForRole(role)}/login`;
}
