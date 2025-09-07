import * as React from "react";
import { cn } from "@/lib/utils"; // or your classnames helper

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
  loading?: boolean; // 👈 add this
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
          variant === "primary" && "bg-black text-white hover:opacity-90",
          variant === "outline" && "border border-gray-300 hover:bg-gray-50",
          loading && "cursor-not-allowed opacity-70",
          className
        )}
        disabled={disabled || loading}
        aria-busy={!!loading}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center">
            <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
              <path d="M22 12a10 10 0 0 1-10 10" fill="currentColor" />
            </svg>
            {typeof children === "string" ? "Processing..." : children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;