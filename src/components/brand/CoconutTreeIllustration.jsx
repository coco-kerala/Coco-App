import { cn } from "@/lib/utils";

export function CoconutTreeIllustration({ className }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={cn("text-coco-green", className)}>
      <circle cx="60" cy="60" r="56" fill="currentColor" opacity="0.08" />
      <path d="M60 95V55" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <path d="M60 55C50 50 45 40 47 30c10 5 15 15 13 25Z" fill="currentColor" opacity="0.7" />
      <path d="M60 55C70 50 75 40 73 30c-10 5-15 15-13 25Z" fill="currentColor" opacity="0.7" />
      <path d="M60 55c-3-10 0-22 5-30-1 12 0 22-5 30Z" fill="currentColor" opacity="0.5" />
      <circle cx="55" cy="54" r="4" fill="currentColor" opacity="0.4" />
      <circle cx="65" cy="54" r="4" fill="currentColor" opacity="0.4" />
      <circle cx="60" cy="48" r="3.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
