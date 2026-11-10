import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Tag({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("tag", className)} {...props} />;
}
