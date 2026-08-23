import { cn } from "@/lib/utils";

/** Full-page GET navigation — bypasses Next.js client router (needed for ?query modals). */
export function QueryNavForm({ action, params = {}, className, children }) {
  return (
    <form action={action} method="get" className={cn("m-0", className)}>
      {Object.entries(params).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {children}
    </form>
  );
}
