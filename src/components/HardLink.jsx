import { cn } from "@/lib/utils";

export function HardLink({ href, className, children, ...props }) {
  return (
    <a href={href} className={cn("no-underline text-inherit", className)} {...props}>
      {children}
    </a>
  );
}
