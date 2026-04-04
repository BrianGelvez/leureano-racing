"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { actualizarEstadoEncargo } from "@/app/actions/encargos";
import {
  ENCARGO_ESTADOS,
  encargoEstadoBadgeClasses,
  encargoEstadoDotClass,
  encargoEstadoMenuItemClasses,
  labelEncargoEstado,
} from "@/lib/encargos-estados";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function EncargoEstadoActions({
  encargoId,
  estadoActual,
}: {
  encargoId: number;
  estadoActual: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const label = labelEncargoEstado(estadoActual);

  async function onEstadoChange(value: string) {
    if (value === estadoActual || pending) return;
    setPending(true);
    try {
      const res = await actualizarEstadoEncargo(encargoId, value);
      if (!res.ok) {
        toast.error("message" in res ? res.message : "No se pudo actualizar");
        return;
      }
      toast.success("Estado actualizado");
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (estadoActual === "ENTREGADO") {
    return (
      <span
        className={cn(
          "inline-flex max-w-full items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-medium",
          encargoEstadoBadgeClasses(estadoActual)
        )}
      >
        <span
          className={cn(
            "h-2 w-2 shrink-0 rounded-full",
            encargoEstadoDotClass(estadoActual)
          )}
          aria-hidden
        />
        {label}
      </span>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={(o) => !pending && setOpen(o)}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={pending}
          className={cn(
            "group inline-flex min-h-[2rem] min-w-[11rem] max-w-[min(100%,16rem)] items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-all",
            "backdrop-blur-sm hover:border-[#E01010]/40 hover:shadow-[0_0_20px_rgba(224,16,16,0.1)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E01010]/45",
            "disabled:pointer-events-none disabled:opacity-55",
            encargoEstadoBadgeClasses(estadoActual)
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                encargoEstadoDotClass(estadoActual)
              )}
              aria-hidden
            />
            <span className="truncate">{label}</span>
          </span>
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-white/70" />
          ) : (
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-white/50 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[13rem] border-white/[0.12] bg-[#141414]/95 p-1 shadow-xl backdrop-blur-md"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
          Cambiar estado
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuRadioGroup
          value={estadoActual}
          onValueChange={onEstadoChange}
        >
          {ENCARGO_ESTADOS.map((b) => (
            <DropdownMenuRadioItem
              key={b.estado}
              value={b.estado}
              disabled={pending}
              className={cn(
                "cursor-pointer rounded-md py-2.5 pl-8 pr-3 text-sm transition-colors",
                encargoEstadoMenuItemClasses(b.estado, estadoActual === b.estado)
              )}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-full",
                    encargoEstadoDotClass(b.estado)
                  )}
                  aria-hidden
                />
                {b.label}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
