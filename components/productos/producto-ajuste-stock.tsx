"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ajusteStockSchema } from "@/lib/validations";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ajustarStockManual } from "@/app/actions/productos";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Form = z.infer<typeof ajusteStockSchema>;

export function ProductoAjusteStock({
  productoId,
  stockActual,
}: {
  productoId: number;
  stockActual: number;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(ajusteStockSchema),
    defaultValues: {
      productoId,
      nuevoStock: stockActual,
      motivo: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({ productoId, nuevoStock: stockActual, motivo: "" });
    }
  }, [open, productoId, stockActual, reset]);

  async function onSubmit(data: Form) {
    const res = await ajustarStockManual(data);
    if (!res.ok) {
      toast.error("message" in res ? res.message : "Error");
      return;
    }
    toast.success("Stock actualizado");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Ajuste manual</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajuste manual de stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("productoId", { valueAsNumber: true })} />
          <div className="space-y-2">
            <Label>Nuevo stock</Label>
            <Input type="number" {...register("nuevoStock", { valueAsNumber: true })} />
            {errors.nuevoStock && (
              <p className="text-sm text-red-400">{errors.nuevoStock.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Motivo (obligatorio)</Label>
            <Textarea {...register("motivo")} rows={3} />
            {errors.motivo && (
              <p className="text-sm text-red-400">{errors.motivo.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Guardar ajuste</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
