"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { QueryNavForm } from "@/components/QueryNavForm";

const variants = {
  primary: "bg-coco-green text-white hover:bg-coco-green-dark shadow-sm active:scale-[0.97]",
  secondary: "bg-coco-terracotta text-white hover:opacity-90 shadow-sm active:scale-[0.97]",
  outline: "bg-transparent border border-coco-border text-coco-ink hover:bg-coco-cream-dark active:scale-[0.97]",
  ghost: "bg-transparent text-coco-green hover:bg-coco-leaf-soft",
  danger: "bg-coco-danger text-white hover:opacity-90 active:scale-[0.97]",
  soft: "bg-coco-leaf-soft text-coco-green hover:bg-[#d7ebdd] active:scale-[0.97]",
};

const sizes = {
  sm: "h-9 px-3.5 text-sm rounded-xl",
  md: "h-11 px-5 text-[15px] rounded-2xl",
  lg: "h-[52px] px-6 text-base rounded-2xl",
};

const baseClass = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 no-underline select-none";

export const Button = forwardRef(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    fullWidth,
    loading,
    disabled,
    href,
    navTo,
    navParams,
    children,
    onClick,
    type = "button",
    ...props
  },
  ref
) {
  const classes = cn(
    baseClass,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    (disabled || loading) && "opacity-50 pointer-events-none",
    className
  );

  if (navTo) {
    return (
      <QueryNavForm action={navTo} params={navParams} className={fullWidth ? "w-full block" : "inline-block"}>
        <button type="submit" disabled={disabled || loading} className={classes} ref={ref} {...props}>
          {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {children}
        </button>
      </QueryNavForm>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} ref={ref} onClick={onClick} {...props}>
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
        {children}
      </a>
    );
  }

  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={classes} onClick={onClick} {...props}>
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {children}
    </button>
  );
});
