import { create } from "zustand";

interface EstadoToast {
  mensagem: string | null;
  mostrar: (mensagem: string) => void;
  limpar: () => void;
}

let temporizador: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<EstadoToast>((set) => ({
  mensagem: null,
  mostrar: (mensagem) => {
    if (temporizador) clearTimeout(temporizador);
    set({ mensagem });
    temporizador = setTimeout(() => set({ mensagem: null }), 2600);
  },
  limpar: () => set({ mensagem: null })
}));
