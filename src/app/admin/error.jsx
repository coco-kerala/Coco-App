"use client";

export default function AdminError({ error, reset }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center bg-coco-cream">
      <p className="text-xl font-extrabold text-coco-ink">Page hit a problem</p>
      <p className="mt-2 text-sm text-coco-muted max-w-sm">
        {error?.message || "Something went wrong loading this page."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 h-12 px-6 rounded-2xl bg-coco-leaf text-white font-bold"
      >
        Try again
      </button>
    </div>
  );
}
