import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", block = false, ...props }, ref) => (
    <button
      ref={ref}
      className={cn("button", `button-${variant}`, block && "button-block", className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
