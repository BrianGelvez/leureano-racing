"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { actualizarEstadoOrden } from "@/app/actions/taller";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const botones = [
  { estado: "EN_PROCESO", label: "En proceso" },
  { estado: "ESPERANDO_REPUESTO", label: "Esperando repuesto" },
  { estado: "LISTA", label: "Lista" },
] as const;

export function OrdenEstadoActions({
  ordenId,
  estadoActual,
}: {
  ordenId: number;
  estadoActual: string;
}) {
  const router = useRouter();
  const [entregarOpen, setEntregarOpen] = useState(false);
  const [medio, setMedio] = useState("EFECTIVO");
  const [trabajo, setTrabajo] = useState("");

  async function cambiar(estado: string) {
    const res = await actualizarEstadoOrden(ordenId, estado);
    if (!res.ok) {
      toast.error("No se pudo actualizar");
      return;
    }
    toast.success("Estado actualizado");
    router.refresh();
  }

  async function entregar() {
    const res = await actualizarEstadoOrden(ordenId, "ENTREGADA", {
      medioPago: medio,
      trabajoRealizado: trabajo || undefined,
    });
    setEntregarOpen(false);
    if (!res.ok) {
      toast.error("Error");
      return;
    }
    toast.success("Orden entregada");
    router.refresh();
  }

  if (estadoActual === "ENTREGADA") return null;

  return (
    <div className="flex flex-wrap gap-2">
      {botones.map((b) => (
        <Button
          key={b.estado}
          type="button"
          variant={estadoActual === b.estado ? "default" : "secondary"}
          disabled={estadoActual === b.estado}
          onClick={() => cambiar(b.estado)}
        >
          {b.label}
        </Button>
      ))}
      <Button type="button" onClick={() => setEntregarOpen(true)}>
        Marcar entregada
      </Button>

      <AlertDialog open={entregarOpen} onOpenChange={setEntregarOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Entregar moto</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-white/70">
              Registrá el cobro y el trabajo realizado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label>Trabajo realizado</Label>
            <Input value={trabajo} onChange={(e) => setTrabajo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Medio de pago</Label>
            <Input value={medio} onChange={(e) => setMedio(e.target.value)} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={entregar}>Confirmar entrega</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
