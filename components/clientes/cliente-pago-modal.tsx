"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registrarPagoCliente } from "@/app/actions/clientes";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ClientePagoModal({ clienteId }: { clienteId: number }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [monto, setMonto] = useState(0);
  const [desc, setDesc] = useState("Pago en efectivo");
  const router = useRouter();

  async function ejecutar() {
    const res = await registrarPagoCliente({
      clienteId,
      monto,
      descripcion: desc,
    });
    setConfirm(false);
    setOpen(false);
    if (!res.ok) {
      toast.error("Error al registrar pago");
      return;
    }
    toast.success("Pago registrado");
    router.refresh();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Registrar pago</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abono cuenta corriente</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Monto</Label>
            <Input
              type="number"
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} />
          </div>
          <Button onClick={() => setConfirm(true)}>Continuar</Button>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar pago?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={ejecutar}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
