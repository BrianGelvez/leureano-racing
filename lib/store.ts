import { create } from "zustand";

/** Estado UI mínimo (extensible para el MVP). */
type UiState = {
  ventaDrawerOpen: boolean;
  setVentaDrawerOpen: (v: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  ventaDrawerOpen: false,
  setVentaDrawerOpen: (v) => set({ ventaDrawerOpen: v }),
}));
