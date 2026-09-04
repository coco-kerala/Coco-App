/** Normalize Indian phone numbers to digits-only E.164-ish form: 91XXXXXXXXXX */
export function normalizePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

export function formatPhoneDisplay(normalized) {
  const d = normalizePhone(normalized);
  if (d.length === 12 && d.startsWith("91")) {
    return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  }
  return d ? `+${d}` : "";
}

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function buildWhatsAppOtpMessage({ name, otp, role }) {
  const app =
    role === "worker" ? "COCO Partner" : role === "admin" ? "COCO Office" : "COCO";
  const who = name ? `Hi ${name},` : "Hi,";
  return `${who} your ${app} login code is *${otp}*. Valid for 10 minutes. Do not share this code.`;
}

export function whatsappDeepLink(phone, text) {
  const d = normalizePhone(phone);
  const wa = d.startsWith("91") ? d : d;
  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
}
