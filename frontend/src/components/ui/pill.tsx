import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Pill({
  tipo,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tipo: "disponivel" | "emprestado" | "atraso" | "manutencao";
}) {
  return <span className={cn("pill", `pill-${tipo}`, className)} {...props} />;
}
