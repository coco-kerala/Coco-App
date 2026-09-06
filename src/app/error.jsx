"use client";

export default function RootError({ error, reset }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center bg-[#f7f3eb]">
      <p className="text-xl font-extrabold text-[#1a1f1c]">Page hit a problem</p>
      <p className="mt-2 text-sm text-[#6b736e] max-w-sm">
        {error?.message || "Please try again."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 h-12 px-6 rounded-2xl bg-[#3a7d2e] text-white font-bold"
      >
        Try again
      </button>
    </div>
  );
}
