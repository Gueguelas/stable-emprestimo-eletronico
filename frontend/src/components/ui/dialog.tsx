import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { Button } from "./button";

export function Dialog({
  aberto,
  aoFechar,
  titulo,
  children,
  confirmar,
  textoConfirmar = "Confirmar",
  largura = "420px"
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  confirmar: () => void;
  textoConfirmar?: string;
  largura?: string;
}) {
  return (
    <DialogPrimitive.Root open={aberto} onOpenChange={(open) => !open && aoFechar()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-backdrop" />
        <DialogPrimitive.Content className="dialog" style={{ maxWidth: largura }}>
          <DialogPrimitive.Title className="dialog-title">{titulo}</DialogPrimitive.Title>
          {children}
          <div className="dialog-actions">
            <Button variant="secondary" onClick={aoFechar}>Cancelar</Button>
            <Button onClick={confirmar}>{textoConfirmar}</Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
