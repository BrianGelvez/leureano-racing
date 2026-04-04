export const ENCARGO_ESTADOS = [
  { estado: "PENDIENTE", label: "Pendiente" },
  { estado: "PEDIDO", label: "Pedido" },
  { estado: "LLEGADO_AVISAR", label: "Llegado — avisar" },
  { estado: "ENTREGADO", label: "Entregado" },
] as const;

export const ESTADOS_ENCARGO_VALIDOS = ENCARGO_ESTADOS.map((e) => e.estado) as readonly string[];

export function labelEncargoEstado(estado: string): string {
  const row = ENCARGO_ESTADOS.find((e) => e.estado === estado);
  return row?.label ?? estado.replace(/_/g, " ");
}

/** Clases para badge / trigger alineadas al flujo del producto (glass + color por etapa). */
export function encargoEstadoBadgeClasses(estado: string): string {
  switch (estado) {
    case "PENDIENTE":
      return "border-amber-500/40 bg-amber-500/[0.14] text-amber-100";
    case "PEDIDO":
      return "border-sky-500/40 bg-sky-500/[0.14] text-sky-100";
    case "LLEGADO_AVISAR":
      return "animate-pulse-soft border-emerald-500/50 bg-emerald-500/[0.14] text-emerald-100";
    case "ENTREGADO":
      return "border-zinc-500/30 bg-zinc-500/[0.08] text-zinc-300";
    default:
      return "border-white/10 bg-white/[0.05] text-white/70";
  }
}

/** Punto de color (intuitivo: ámbar=pendiente, azul=pedido, verde=llegó, gris=cerrado). */
export function encargoEstadoDotClass(estado: string): string {
  switch (estado) {
    case "PENDIENTE":
      return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.55)]";
    case "PEDIDO":
      return "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.45)]";
    case "LLEGADO_AVISAR":
      return "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]";
    case "ENTREGADO":
      return "bg-zinc-500 shadow-none";
    default:
      return "bg-white/50";
  }
}

/** Fila del menú: borde izquierdo + tinte al hover/focus y al estado actual. */
export function encargoEstadoMenuItemClasses(estado: string, isSelected: boolean): string {
  switch (estado) {
    case "PENDIENTE":
      return [
        "border-l-[3px] border-l-amber-400",
        isSelected
          ? "bg-amber-500/25 text-amber-50"
          : "text-amber-50/90 focus:bg-amber-500/18 data-[highlighted]:bg-amber-500/18 data-[highlighted]:text-amber-50",
      ].join(" ");
    case "PEDIDO":
      return [
        "border-l-[3px] border-l-sky-400",
        isSelected
          ? "bg-sky-500/25 text-sky-50"
          : "text-sky-50/90 focus:bg-sky-500/18 data-[highlighted]:bg-sky-500/18 data-[highlighted]:text-sky-50",
      ].join(" ");
    case "LLEGADO_AVISAR":
      return [
        "border-l-[3px] border-l-emerald-400",
        isSelected
          ? "bg-emerald-500/25 text-emerald-50"
          : "text-emerald-50/90 focus:bg-emerald-500/18 data-[highlighted]:bg-emerald-500/18 data-[highlighted]:text-emerald-50",
      ].join(" ");
    case "ENTREGADO":
      return [
        "border-l-[3px] border-l-zinc-500",
        isSelected
          ? "bg-zinc-500/20 text-zinc-200"
          : "text-zinc-200/90 focus:bg-zinc-500/15 data-[highlighted]:bg-zinc-500/15 data-[highlighted]:text-zinc-100",
      ].join(" ");
    default:
      return isSelected ? "bg-white/10" : "focus:bg-white/8 data-[highlighted]:bg-white/8";
  }
}
