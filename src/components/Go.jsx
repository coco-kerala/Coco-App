import Link from "next/link";
import { cn } from "@/lib/utils";

export function Go({ href, className, children, ...props }) {
  return (
    <Link href={href} className={cn("no-underline text-inherit", className)} {...props}>
      {children}
    </Link>
  );
}
